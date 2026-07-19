export type NotificationType = "URGE_UPDATE_ORDERS" | "QTY_PER_CONT_MISMATCH" | string;

export interface NotificationRiskLine {
  lineId: string | null;
  poNum: string | null;
  partNum: string | null;
  pickedQty: number;
  quantityPerCont: number;
}

export interface NotificationContext {
  poNum: string | null;
  orderId: string | null;
  riskLines?: NotificationRiskLine[];
}

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  fromUserName: string;
  fromCustomerCustId: string;
  recipientCustomerCustId: string;
  recipientUserName: string;
  context: NotificationContext;
  createdAt: string;
}

export interface NotificationListResult {
  items: NotificationItem[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
}

export interface ManufactureRecipient {
  customerCustId: string;
  userName: string;
  role: string;
}
