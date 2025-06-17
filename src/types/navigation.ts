export type RootStackParamList = {
  Main: { screen?: keyof TabParamList; params?: object; };
  Auth: undefined;
  Appointments: undefined;
  Orders: undefined;
  Services: undefined;
  NotificationPreferences: undefined;
  Reports: undefined;
  CustomerManagement: undefined;
  DealsHistory: undefined;
  DealsManagement: undefined;
};

export type TabParamList = {
  Home: undefined;
  Book: undefined;
  Deals: undefined;
  Membership: undefined;
  Profile: undefined;
  Admin: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Appointment: undefined;
  Deals: undefined;
  Membership: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}