import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaygroundService {
  // 这里将来可以添加更复杂的业务逻辑
  // 比如数据库操作、缓存管理等
  
  async saveSession(data: any) {
    // 保存会话数据到数据库
    console.log('Saving session:', data);
  }
  
  async getSessionHistory(userId: string) {
    // 获取用户历史记录
    console.log('Getting history for user:', userId);
    return [];
  }
}