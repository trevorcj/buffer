export type GuestStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
};

export type SetupStackParamList = {
  Identity: undefined;
  PinSetup: undefined;
  ChooseMode: undefined;
  Preview: undefined;
  Activation: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CardTab: undefined;
  TransactionsTab: undefined;
  SettingsTab: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  TransactionDetail: {
    transactionId: string;
  };
  ChangeCardPin: undefined;
  FundWallet: undefined;
  SendMoney: undefined;
  WithdrawCushion: undefined;
  PayBill: undefined;
};
