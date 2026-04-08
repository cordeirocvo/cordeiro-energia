import { NextResponse } from "next/server";
import Papa from "papaparse";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/1esS5CGW5uYLHOhLc_Bd1B_0A3_DIYsjcw8wSmy3dvyc/export?format=csv&id=1esS5CGW5uYLHOhLc_Bd1B_0A3_DIYsjcw8wSmy3dvyc&gid=0";

export async function POST() {
  try {
    // 1. Create Admin if not exists
    const adminExists = await prisma.user.findUnique({ where: { username: "admin" } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
         data: { username: "admin", password: hashedPassword, role: "ADMIN" }
      });
    }

    // 2. Fetch CSV
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, { cache: "no-store" });
    const csvContent = await response.text();

    const result = Papa.parse(csvContent, { header: false });
    const rows = result.data as string[][];

    // Load all existing names into memory (1 query instead of 2000)
    const existingRecords = await prisma.planilhaInstalacao.findMany({
       select: { id: true, cliente: true }
    });
    const existingMap = new Map();
    existingRecords.forEach(r => {
        if(r.cliente) existingMap.set(r.cliente, r.id);
    });

    let upsertCount = 0;
    // Row 6 (index 5) is the first data row based on the preview
    
    // We will collect transactions
    const transactions = [];

    for (let i = 5; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;

        const cliente = row[1]?.trim();
        if (!cliente || cliente.includes("Cliente") || cliente === "") continue;

        const existingId = existingMap.get(cliente);

        const data: any = {
             cliente,
             diaPrev: row[2] || "",
             instalacao: row[3] || "",
             obsInstalacao: row[5] || "",
             vencimentoParecer: row[6] || "",
             vencimentoContrato: row[7] || "",
             prevInstala: row[8] || "",
             dataVenda: row[9] || "",
             statusProtocolo: row[10] || "",
             statusCompra: row[11] || "",
             inversor: row[12] || "",
             nMod: row[13] || "",
             modulo: row[14] || "",
             cidadeOriginal: row[15] || "",
             bairro: row[16] || "",
             rua: row[17] || "",
             nRua: row[18] || "",
             telhado: row[19] || "",
             telefoneOriginal: row[20] || "",
             vendedorOriginal: row[21] || ""
        };

        // Lógica de Blindagem: Só altera o status local se a planilha confirmar finalização
        const isFinalized = (row[3]?.trim().toUpperCase() === "SIM" || row[3]?.trim().toUpperCase() === "TRUE");
        if (isFinalized) {
            data.status = "FINALIZADO";
        }

        if (existingId) {
            transactions.push(
               prisma.planilhaInstalacao.update({
                 where: { id: existingId },
                 data
               })
             );
        } else {
             transactions.push(
               prisma.planilhaInstalacao.create({ data })
             );
        }
        upsertCount++;
        
        // Batch execute every 200 to not overload memory
        if (transactions.length >= 200) {
            await prisma.$transaction(transactions);
            transactions.length = 0; // clear
        }
    }
    
    // Execute remaining
    if (transactions.length > 0) {
        await prisma.$transaction(transactions);
    }

    return NextResponse.json({ success: true, upsertCount });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
