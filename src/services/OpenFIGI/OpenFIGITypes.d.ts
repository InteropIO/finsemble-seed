import { ICentralLogger } from "clients/ICentralLogger";
import { IRouterClient } from "clients/IRouterClient";

export interface Finsemble {
  baseService: any;
  Clients: {
    RouterClient: IRouterClient
    Logger: ICentralLogger
  }
}
export enum idType {
  "ID_ISIN",
  "ID_BB_UNIQUE",
  "ID_SEDOL",
  "ID_COMMON",
  "ID_WERTPAPIER",
  "ID_CUSIP",
  "ID_BB",
  "ID_ITALY",
  "ID_EXCH_SYMBOL",
  "ID_FULL_EXCHANGE_SYMBOL",
  "COMPOSITE_ID_BB_GLOBAL",
  "ID_BB_GLOBAL_SHARE_CLASS_LEVEL",
  "ID_BB_SEC_NUM_DES",
  "ID_BB_GLOBAL",
  "TICKER",
  "ID_CUSIP_8_CHR",
  "OCC_SYMBOL",
  "UNIQUE_ID_FUT_OPT",
  "OPRA_SYMBOL",
  "TRADING_SYSTEM_IDENTIFIER",
  "ID_CINS",
  "ID_SHORT_CODE",
  "BASE_TICKER",
  "VENDOR_INDEX_CODE",
}

interface FigiResponse {
  figi: string;
  name: string;
  ticker: string;
  exchCode: string;
  compositeFIGI: string;
  uniqueID: string;
  securityType: string;
  marketSector: string;
  shareClassFIGI: string;
  uniqueIDFutOpt: null;
  securityType2: string;
  securityDescription: string;
}
interface FigiRequest {
  idType: idType;
  idValue: string | number;
  exchCode?: string;
  micCode?: string;
  currency?: string;
  marketSECDES?: string;
  securityType?: string;
  securityType2?: string;
  includeUnlistedEquities?: boolean;
  optionType?: any;
  strike?: Array<number>;
  contractSize?: Array<number>;
  coupon?: Array<number>;
  expiration?: Array<number>;
  maturity?: Array<number>;
  stateCode?: string;
}
