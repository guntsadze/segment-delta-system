export interface INotificationGateway {
  sendSystemLog(data: any): void;
  sendSegmentUpdate(segmentId: string, data: any): void;
  sendDeltaUpdate(segmentId: string, delta: any): void;
  sendCampaignLog(data: any): void;
}
