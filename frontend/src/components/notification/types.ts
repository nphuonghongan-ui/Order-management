export type NotificationType = "URGE_UPDATE_ORDERS" | string;

export interface NotificationContext {
  poNum: string | null;
  orderId: string | null;
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
