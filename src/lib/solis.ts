import crypto from 'crypto';
import prisma from './prisma';

const KEY_ID = process.env.SOLIS_KEY_ID || '';
const KEY_SECRET = process.env.SOLIS_KEY_SECRET || '';
const API_URL = process.env.SOLIS_API_URL || 'https://www.soliscloud.com:13333';

/**
 * Solis API Client Implementation
 * Based on Solis official documentation for HMAC-SHA1 Authentication
 */
class SolisClient {
  private async request(path: string, body: any = {}) {
    const verb = 'POST';
    const contentType = 'application/json;charset=utf-8';
    const date = new Date().toUTCString();
    
    // 1. Content-MD5 (MD5 of body)
    const bodyStr = JSON.stringify(body);
    const contentMd5 = crypto.createHash('md5').update(Buffer.from(bodyStr, 'utf8')).digest('base64');
    
    // 2. String to Sign
    // Verb + "\n" + Content-MD5 + "\n" + Content-Type + "\n" + Date + "\n" + Path
    const stringToSign = `${verb}\n${contentMd5}\n${contentType}\n${date}\n${path}`;
    
    // 3. Signature
    const signature = crypto
      .createHmac('sha1', KEY_SECRET)
      .update(stringToSign)
      .digest('base64');
    
    const headers = {
      'Content-Type': contentType,
      'Content-MD5': contentMd5,
      'Date': date,
      'Authorization': `API ${KEY_ID}:${signature}`,
    };

    const response = await fetch(`${API_URL}${path}`, {
      method: verb,
      headers,
      body: bodyStr,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Solis API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data.code !== '0') {
        throw new Error(`Solis API Business Error: ${data.msg} (Code: ${data.code})`);
    }

    return data.data;
  }

  // --- API Endpoints ---

  /** Lista todas as usinas associadas ao KeyID */
  async getStationList(pageNo = 1, pageSize = 20) {
    return this.request('/v1/api/userStationList', { pageNo, pageSize });
  }

  /** Detalhes de uma usina específica */
  async getStationDetail(id: string) {
    return this.request('/v1/api/stationDetail', { id });
  }

  /** Lista de inversores de uma usina */
  async getInverterList(stationId: string, pageNo = 1, pageSize = 20) {
    return this.request('/v1/api/inverterList', { stationId, pageNo, pageSize });
  }

  /** Detalhes de um inversor (técnico) */
  async getInverterDetail(id: string, sn: string) {
    return this.request('/v1/api/inverterDetail', { id, sn });
  }

  /** Lista de alarmes abertos/fechados */
  async getAlarmList(stationId: string, alarmStatus?: number, pageNo = 1, pageSize = 20) {
    return this.request('/v1/api/alarmList', { stationId, alarmStatus, pageNo, pageSize });
  }

  /** Geração diária de energia de uma usina */
  async getStationDay(id: string, money = 'BRL', date = new Date().toISOString().split('T')[0]) {
    return this.request('/v1/api/stationDay', { id, money, time: date });
  }

  // --- Sync Logic ---

  /** Executa o sincronismo completo e exporta para o Supabase */
  async syncAll() {
    console.log('--- Iniciando Sync Solis Cloud ---');
    
    // 1. Buscar Usinas
    const stationsData = await this.getStationList();
    const stations = stationsData.page.records;

    for (const s of stations) {
      console.log(`Syncing Station: ${s.id} - ${s.stationName}`);
      
      // Upsert Station
      await prisma.solisStation.upsert({
        where: { id: String(s.id) },
        update: {
          stationName: s.stationName,
          fullAddress: s.fullAddress,
          power: s.power,
          status: s.status,
          rawJson: s,
        },
        create: {
          id: String(s.id),
          stationName: s.stationName,
          fullAddress: s.fullAddress,
          power: s.power,
          status: s.status,
          rawJson: s,
        },
      });

      // 2. Buscar Inversores da Usina
      const invertersData = await this.getInverterList(s.id);
      const inverters = invertersData.page.records;

      for (const inv of inverters) {
        await prisma.solisInverter.upsert({
          where: { sn: inv.sn },
          update: {
            id: String(inv.id),
            stationId: String(s.id),
            model: inv.model,
            rawJson: inv,
          },
          create: {
            id: String(inv.id),
            sn: inv.sn,
            stationId: String(s.id),
            model: inv.model,
            rawJson: inv,
          },
        });
      }

      // 3. Buscar Alarmes Recentes
      const alarmsData = await this.getAlarmList(s.id);
      const alarms = alarmsData.page.records;

      for (const al of alarms) {
        // Como o ID do alarme na Solis pode variar, usamos um hash ou deixamos o unique do Prisma (uuid)
        // Aqui apenas criamos novos se não houver lógica de conciliação clara
        await prisma.solisAlarm.create({
          data: {
            stationId: String(s.id),
            alarmId: String(al.alarmId),
            alarmName: al.alarmName,
            alarmDevice: al.alarmDevice,
            alarmStatus: al.alarmStatus,
            alarmTime: al.alarmTime ? new Date(al.alarmTime) : null,
            rawJson: al,
          }
        });
      }

      // 4. Buscar Geração Diária (Hoje)
      try {
        const generation = await this.getStationDay(s.id);
        if (generation && generation.length > 0) {
            for (const gen of generation) {
                 await prisma.solisGenerationLog.create({
                    data: {
                        stationId: String(s.id),
                        date: gen.timeStr || new Date().toISOString().split('T')[0],
                        energy: parseFloat(gen.energy || '0'),
                        rawJson: gen,
                    }
                });
            }
        }
      } catch (e) {
        console.error(`Erro ao buscar geração para usina ${s.id}:`, e);
      }
    }

    // Atualizar Configuração de Último Sync
    await prisma.solisConfig.upsert({
      where: { id: 'default' },
      update: { lastSync: new Date() },
      create: { id: 'default', syncInterval: 10, lastSync: new Date() },
    });

    console.log('--- Sync Solis Cloud Concluído ---');
  }
}

export const solis = new SolisClient();
