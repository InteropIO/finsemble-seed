var financialData = {};
var financialDataContainerMap = {};

var fieldMapping = {}
fieldMapping.BalanceSheet = [
	['Assets', [
		{
			textLabel: "Cash and Cash Equivalents",
			id: "Csh_Csh_Equ",
			type: 'f',
			display: ['a', 'c', 'd']
		},
		/*bs1020: {
			textLabel: "Restricted Cash",
			id: "Rst_Csh",
			type
		},
		bs1030: {
			textLabel: "Short Term Investments",
			id: "Mkt_Sec"
		},*/
		{
			textLabel: "Net Receivables",
			id: "Rec",
			type: 'f',
			display: ['a', 'd']
		},
		{
			textLabel: "Inventory",
			id: "Inv",
			type: 'f',
			display: ['a']
		},
		/*bs1060: {
			textLabel: "Prepaid Expenses",
			id: "Ppd_Exp"
		},
		bs1070: {
			textLabel: "Deferred Income Taxes",
			id: "Cur_Def_Inc_Tax"
		},*/
		{
			textLabel: "Other Current Assets",
			id: "Oth_Cur_Ass",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Total Current Assets",
			id: "Tot_Cur_Ass",
			type: 'st',
			display: ['a']
		},

		{
			textLabel: "Total Cash Due From Banks",
			id: "Tot_Cash_Bnk",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Total Investments Banks",
			id: "Tot_Inv_Bnk",
			type: 'f',
			display: ['b', 'c', 'd']
		},
		{
			textLabel: "Net Loans",
			id: "Net_Loans",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Investment In Unconsolidated Affiliates",
			id: "Inv_Uncon_Aff",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Customer Liability On Acceptances",
			id: "Cust_Liab_Accept",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Real Estate Assets",
			id: "Real_Est_Ass",
			type: 'f',
			display: ['b']
		},

		{
			textLabel: "Investment Securities",
			id: "Inv_Sec",
			type: 'f',
			display: ['d']
		},
		{
			textLabel: "Securities In Custody",
			id: "Sec_Cust",
			type: 'f',
			display: ['d']
		},

		{
			textLabel: "Premium Balance Receivables",
			id: "Prem_Bal_Rec",
			type: 'f',
			display: ['c']
		},
		{
			textLabel: "Investment In Unconsolidated Affiliates",
			id: "Inv_Uncon_Aff",
			type: 'f',
			display: ['c', 'd']
		},

		/*bs1510: {
			textLabel: "Long Term Investments",
			id: ""
		},
		bs1520: {
			textLabel: "Property, Plant and Equipment",
			id: "Grs_Fix_Ass"
		},
		bs1530: {
			textLabel: "Accumulated Amortization",
			id: "Acc_Depr_Depl"
		},*/
		{
			textLabel: "Net Property, Plant and Equipment",
			id: "Net_Fix_Ass",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Total Investments And Advances",
			id: "Tot_Inv_Adv",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Long Term Note Receivable",
			id: "Lng_Trm_Note_Rec",
			type: 'f',
			display: ['a']
		},
		/*bs1560: {
			textLabel: "Goodwill",
			id: "Cost_Exc"
		},*/
		{
			textLabel: "Intangible Assets",
			id: "Intang",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Other Non Current Assets",
			id: "Oth_Non_Cur_Ass",
			type: 'f',
			display: ['a']
		},
		/*bs1590: {
			textLabel: "Deferred Long Term Asset Charges",
			id: "Non_Cur_Def_Inc_Tax"
		},*/
		{
			textLabel: "Total Non Current Assets",
			id: "Tot_Non_Cur_Ass",
			type: 'st',
			display: ['a']
		},

		{
			textLabel: "Interest Receivables",
			id: "Int_Rec",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Deferred Tax Assets",
			id: "Def_Tax_Ass",
			type: 'f',
			display: ['b', 'c', 'd']
		},
		{
			textLabel: "Other Intangible Assets",
			id: "Oth_Intang",
			type: 'f',
			display: ['b', 'c', 'd']
		},

		{
			textLabel: "Total Assets",
			id: "Tot_Ass",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		}
	]],
	['Liabilities', [
		{
			textLabel: "Accounts Payable",
			id: "Acc_Pay",
			type: 'f',
			display: ['a']
		},
		/*bs2020: {
			textLabel: "Accrued Liabilities",
			id: "Acc_Liab"
		},
		bs2030: {
			textLabel: "Deferred Revenue",
			id: "Def_Rev"
		},*/
		{
			textLabel: "Short/Current Long Term Debt",
			id: "Sht_Trm_Debt",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Other Current Liabilities",
			id: "Oth_Cur_Liab",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Total Current Liabilities",
			id: "Tot_Cur_Liab",
			type: 'st',
			display: ['a']
		},

		{
			textLabel: "Insurance Policy Liabilities Insurance",
			id: "Ins_Pol_Liab_Ins",
			type: 'f',
			display: ['c']
		},

		{
			textLabel: "Total Deposits",
			id: "Tot_Dep",
			type: 'f',
			display: ['b', 'd']
		},
		{
			textLabel: "Total Debt",
			id: "Tot_Debt",
			type: 'f',
			display: ['b', 'c', 'd']
		},

		{
			textLabel: "Long Term Debt",
			id: "Lng_Trm_Debt",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Provision For Risks Charges",
			id: "Prov_Risk_Chg",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Deferred Long Term Liability Charges",
			id: "Def_Inc_Tax_Liab",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Other Liabilities",
			id: "Oth_Non_Cur_Liab",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*bs2550: {
			textLabel: "Minority Interest",
			id: "Min_Int_Liab"
		},*/
		{
			textLabel: "Total Non Current Liabilities",
			id: "Tot_Non_Cur_Liab",
			type: 'st',
			display: ['a']
		},
		{
			textLabel: "Total Liabilities",
			id: "Tot_Liab",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},
	]],
	["Stockholder's Equity", [
		{
			textLabel: "Non Equity Reserves",
			id: "Non_Equ_Res",
			type: 'f',
			display: ['c']
		},
		/*bs3010: {
			textLabel: "Preferred Stock",
			id: "Prf_Stk_Equ"
		},*/
		{
			textLabel: "Preferred Stock Carrying Value",
			id: "Prf_Stk_Carry_Val",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*bs3030: {
			textLabel: "Common Stock",
			id: "Com_Par"
		},
		bs3040: {
			textLabel: "Retained Earnings",
			id: "Ret_Earn"
		},
		bs3050: {
			textLabel: "Treasury Stock",
			id: "Trs_Stk"
		},
		bs3060: {
			textLabel: "Capital Surplus",
			id: "Add_Paid_Cap"
		},*/
		{
			textLabel: "Common Equity",
			id: "Com_Equ",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*bs3080: {
			textLabel: "Other Stockholder Equity",
			id: "Oth_Equ_Adj"
		},*/
		{
			textLabel: "Total Stockholder Equity",
			id: "Tot_Stk_Equ",
			type: 'st',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Minority Interest",
			id: "Min_Int_Equ",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Total Equity",
			id: "Tot_Equ",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},

		{
			textLabel: "Book Value Per Share",
			id: "Bk_Val_Per_Sh",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Tangible Book Value Per Share",
			id: "Tang_Bk_Val_Per_Sh",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Tier 1 Capital",
			id: "Tier1_Cap",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Tier 2 Capital",
			id: "Tier2_Cap",
			type: 'f',
			display: ['b']
		},
	]]
];

fieldMapping.Income = [
	['Income', [
		{
			textLabel: "Sales Or Revenue",
			id: "Sls_Rev",
			type: 'st',
			display: ['a', 'c', 'd']
		},
		{
			textLabel: "Interest Income",
			id: "Int_Inc",
			type: 'st',
			display: ['b']
		},
		{
			textLabel: "Cost Of Goods Sold",
			id: "Cost_Gds_Sld",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Losses, Claims, Reserves",
			id: "Loss_Clm_Res",
			type: 'f',
			display: ['c']
		},
		{
			textLabel: "Gross Income",
			id: "Grs_Inc",
			type: 't',
			display: ['a']
		},

	]],
	['Operating Expenses', [
		{
			textLabel: "Selling, General, Administrative Expenses",
			id: "Sell_Gen_Adm_Exp",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Selling, General, Administrative Expenses And Other",
			id: "Sell_Gen_Adm_Exp_Oth",
			type: 'f',
			display: ['c']
		},
		{
			textLabel: "Other Operating Expense",
			id: "Oth_Oper_Exp",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Total Interest Expense",
			id: "Int_Exp",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Total Expenses",
			id: "Tot_Exp",
			type: 'f',
			display: ['d']
		},
		{
			textLabel: "Total Operating Expense",
			id: "Tot_Oper_Exp",
			type: 'st',
			display: ['a']
		},
		{
			textLabel: "EBIT Operating Income",
			id: "EBIT_OI",
			type: 't',
			display: ['a']
		},
	]],
	['Income from Continuing Operations', [
		{
			textLabel: "EBIT Operating Income",
			id: "EBIT_OI",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Net Interest Income",
			id: "Net_OI",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Loan Loss Provision",
			id: "LLP",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Net Interest Income After Loan Loss Provision",
			id: "NII_Aft_LLP",
			type: 'st',
			display: ['b']
		},
		{
			textLabel: "Operating Income Before Interest Expense",
			id: "OI_Bef_IE",
			type: 'f',
			display: ['c']
		},
		{
			textLabel: "Interest Expense",
			id: "IE",
			type: 'f',
			display: ['a', 'c']
		},
		{
			textLabel: "Operating Income After Interest Expense",
			id: "OI_Aft_IE",
			type: 'st',
			display: ['c']
		},
		{
			textLabel: "Non Interest Income",
			id: "Non_Int_Inc",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Non Interest Expense",
			id: "Non_Int_Exp",
			type: 'f',
			display: ['b']
		},
		{
			textLabel: "Operating Income",
			id: "OI",
			type: 'st',
			display: ['b', 'd']
		},
		{
			textLabel: "Non Operating Income",
			id: "Non_Oper_Inc_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Reserves Charge",
			id: "Res_Chg",
			type: 'f',
			display: ['c']
		},
		{
			textLabel: "Unusual Expense",
			id: "Un_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Pretax Income",
			id: "Ptx_Inc",
			type: 'st',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Income Taxes",
			id: "Inc_Tax",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Equity In Earnings Of Affiliates Income",
			id: "Equ_Earn_Aff_Inc",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Other After Tax Adjustments",
			id: "Oth_Aft_Tax_Adj",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Consolidated Net Income",
			id: "Cons_New_Inc",
			type: 'st',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Minority Interest Expense",
			id: "Min_Int_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Net Income Continuing Operations",
			id: "Net_Inc_Cont_Oper",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Preferred Dividends",
			id: "Pref_Div",
			type: 'f',
			display: ['a', 'b', 'c']
		},
		{
			textLabel: "Net Income Available To Common Basic",
			id: "Net_Inc_Avail_Comm_Bas",
			type: 't',
			display: ['a', 'b', 'c']
		},
		{
			textLabel: "EPS Diluted Before Unusual Expense",
			id: "EPS_Dil_Bef_Un_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "EPS Basic Before Extraordinaries",
			id: "EPS_Basic_Bef_Extra",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "EPS Fully Diluted",
			id: "EPS_Dil",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "EBITDA",
			id: "EBITDA",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Ordinary Income",
			id: "Ord_Inc",
			type: 'f',
			display: ['b', 'c', 'd']
		},
		{
			textLabel: "Stock Option Compensation Expense",
			id: "Stk_Opt_Comp_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Operating Lease Expense",
			id: "Oper_Lease_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Foreign Currency Adjustment",
			id: "Fgn_Curr_Adj",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		}
	]]
];


fieldMapping.CashFlow = [
	['Income', [
		{
			textLabel: "Net Income",
			id: "Net_Inc",
			type: 'f',
			display: ['a']
		},

	]],
	['Operating Activities, Cash Flows Provided By or Used In', [
		{
			textLabel: "Depreciation & Amortization",
			id: "Dep_Amort",
			type: 'f',
			display: ['a']
		},
		/*cf1012: {
			textLabel: "Depreciation",
			id: "Depreciation",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		cf1015: {
			textLabel: "Amortization",
			id: "Amortization"
		},
		cf1018: {
			textLabel: "Amortization of Intangible Expenses",
			id: "Amort_Intang"
		},
		cf1020: {
			textLabel: "Adjustments To Net Income",
			id: "Adj_Net_Inc"
		},*/
		{
			textLabel: "Deferred Income Taxes",
			id: "Def_Tax",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Other Funds",
			id: "Oth_Fds",
			type: 'f',
			display: ['a']
		},
		{
			textLabel: "Funds From Operations",
			id: "Fds_Oper",
			type: 'st',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf1030: {
			textLabel: "Increase Or Decrease In Receivables",
			id: "Receivables"
		},
		cf1032: {
			textLabel: "Increase Or Decrease In Payables",
			id: "Payables"
		},
		cf1035: {
			textLabel: "Changes In Accounts Receivables",
			id: "Chg_Acc_Rec"
		},
		cf1040: {
			textLabel: "Changes In Liabilities",
			id: "Chg_Liab"
		},
		cf1042: {
			textLabel: "Increase Or Decrease In Other Current Assets",
			id: "Curr_Assets"
		},
		cf1045: {
			textLabel: "Increase Or Decrease In Other Current Liabilities",
			id: "Curr_Liab"
		},
		cf1050: {
			textLabel: "Changes In Inventories",
			id: "Chg_Inventory"
		},*/
		{
			textLabel: "Extraordinary Items",
			id: "ExtraOrd",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf1060: {
			textLabel: "Changes In Other Operating Activities",
			id: "Chg_Oper_Other"
		},
		cf1062: {
			textLabel: "Other Non Cash Items",
			id: "Oth_Non_Csh"
		},*/
		{
			textLabel: "Increase Or Decrease In Other Working Capital",
			id: "Working_Cap",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf1068: {
			textLabel: "Increase Or Decrease In Prepaid Expenses",
			id: "Ppd_Exp"
		},
		cf1070: {
			textLabel: "Operating Gains Or Losses",
			id: "Oper_Gain_Loss"
		},*/
		{
			textLabel: "Total Cash Flow From Operating Activities",
			id: "Operating_Total",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},
	]],
	['Investing Activities, Cash Flows Provided By or Used In', [
		{
			textLabel: "Capital Expenditures",
			id: "Cap_Exp",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf2012: {
			textLabel: "Purchase Of Property Plant And Equipment",
			id: "Pur_Prop_Plt_Equ"
		},*/
		{
			textLabel: "Sale Of Property Plant And Equipment",
			id: "Sale_Prop_Plt_Equ",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Aquisitions",
			id: "Aquisitions",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Investments",
			id: "Investments",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf2021: {
			textLabel: "Purchase Of Long Term Investments",
			id: "Pur_LT_Inv"
		},
		cf2022: {
			textLabel: "Purchase Of Short Term Investments",
			id: "Pur_ST_Inv"
		},
		cf2023: {
			textLabel: "Purchase Of Investment Securities",
			id: "Pur_Inv_Sec"
		},
		cf2024: {
			textLabel: "Sale Of Long Term Investments",
			id: "Sale_LT_Inv"
		},
		cf2025: {
			textLabel: "Sale Of Short Term Investments",
			id: "Sale_ST_Inv"
		},
		cf2026: {
			textLabel: "Proceeds From Sale And Maturity Of Investment",
			id: "Sale_Inv_Sec"
		},
		cf2030: {
			textLabel: "Other Cash flows from Investing Activities",
			id: "Investing_Other"
		},*/
		{
			textLabel: "Increase In Loans",
			id: "Inc_Loans",
			type: 'f',
			display: ['b', 'd']
		},
		{
			textLabel: "Decrease In Loans",
			id: "Dec_Loans",
			type: 'f',
			display: ['b', 'd']
		},
		{
			textLabel: "Federal Home Loan Advances Change",
			id: "FHL_Adv_Chg",
			type: 'f',
			display: ['b', 'd']
		},
		{
			textLabel: "Other Uses",
			id: "Other_Uses",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Other Sources",
			id: "Other_Srcs",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Total Cash Flows From Investing Activities",
			id: "Investing_Total",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},

	]],
	['Financing Activities, Cash Flows Provided By or Used In', [
		{
			textLabel: "Dividends Paid",
			id: "Div_Paid",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf3020: {
			textLabel: "Sale Purchase of Stock",
			id: "Sale_Pur_Stock"
		},
		cf3022: {
			textLabel: "Issuance Of Capital Stock",
			Id: "Iss_Stock"
		},
		cf3025: {
			textLabel: "Repurchase Of Capital Stock",
			id: "Repur_Stock"
		},*/
		{
			textLabel: "Change In Capital Stock",
			id: "Chg_Stock",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		/*cf3030: {
			textLabel: "Net Borrowings",
			id: "Net_Borr"
		},
		cf3032: {
			textLabel: "Issuance Of Debt",
			id: "Iss_Debt"
		},
		cf3035: {
			textLabel: "Repayment Of Debt",
			id: "Repay_Debt"
		},*/
		{
			textLabel: "Issuance Or Reduction Of Debt",
			id: "Debt_Net",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Other Cash Flows from Financing Activities",
			id: "Financing_Other",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Total Cash Flows From Financing Activities",
			id: "Financing_Total",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Effect Of Exchange Rate Changes",
			id: "Chg_Eff_Exch_Rate",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Miscellaneous Funds",
			id: "Misc_Fds",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Change In Cash and Cash Equivalents",
			id: "Chg_Csh_Csh_Equ",
			type: 't',
			display: ['a', 'b', 'c', 'd']
		},
		{
			textLabel: "Free Cash Flow",
			id: "Free_Csh_Flw",
			type: 'f',
			display: ['a', 'b', 'c', 'd']
		},


	]]
];

function showFinancialData(containerObject, settings) {
	//debugger;

	var containerId = containerObject.attr('id');
	//var containerWidthInches = containerObject.width()/pixelsPerInch;
	var maxColumns = Math.round((containerObject.width() - 400) / 150) + 1;
	if (maxColumns < 1) maxColumns = 1;


	if (settings && settings.resize && financialDataContainerMap[containerId].maxColumns == maxColumns) {
		return;
	}

	financialDataContainerMap[containerId].maxColumns = maxColumns;

	if (settings) {
		if (settings.term) financialDataContainerMap[containerId].term = settings.term;
		if (settings.statementType) financialDataContainerMap[containerId].statementType = settings.statementType;
	}

	var term = financialDataContainerMap[containerId].term;
	var statementType = financialDataContainerMap[containerId].statementType;

	var statementTypeFieldMapping;
	switch (statementType) {
		case 'Income Statement':
			statementTypeFieldMapping = fieldMapping.Income;
			break;
		case 'Balance Sheet':
			statementTypeFieldMapping = fieldMapping.BalanceSheet;
			break;
		case 'Cash Flow':
			statementTypeFieldMapping = fieldMapping.CashFlow;
			break;
	}

	var data = financialData[financialDataContainerMap[containerId].symbol][term];

	if (!_.size(data.financials)) return;

	var table = $('<table style="text-align: right; width:100%">');
	var dateRow = $('<tr>');
	dateRow.append($('<th>'));

	_.each(data.financials, function (value, key) {
		if (key < maxColumns) {
			var dateCell = $('<th>').append(PortalCore.mmddyyyy(value.Date));
			dateRow.append(dateCell);
		}
	});

	table.append(dateRow);
	var type = data.financials[0].Type;

	_.each(statementTypeFieldMapping, function (value) {
		//header row
		var headerRow = $('<tr>').append($('<th>').append(value[0]).attr('colspan', Math.min(maxColumns, data.financials.length) + 1)).css('text-align', 'left').addClass('ciq-financials-header');
		table.append(headerRow);
		_.each(value[1], function (fields) {
			if (fields.display.indexOf(type) >= 0) {
				var tableRow = $('<tr>');
				tableRow.append($('<td>').append(fields.textLabel).css('text-align', 'left'));
				_.each(data.financials, function (financials, key) {
					if (key < maxColumns) {
						var number = financials.Fields[fields.id];
						if (Math.round(number) == number) {
							number = PortalCore.commaInt(number);
						} else {
							number = number.toFixed(2);
						}
						if (number == 0) number = '-';
						tableRow.append($('<td>').append(number)).addClass('field');
					}
				});
				if (fields.type == 'st') tableRow.addClass('ciq-subtotal');
				else if (fields.type == 't') tableRow.addClass('ciq-total');
				table.append(tableRow);
			}

		});
	});

	tableDiv = $('#' + containerId + '-table-div');

	tableDiv.html(table);
	//containerObject.show();
}

function financialsCallback(err, data, containerObject) {
	//debugger;

	if (!data) {
		containerObject.html('');
		return;
	}

	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];
	var settings;
	if (data && data.settings) settings = data.settings
	else settings = portalSettings.items[widgetId];
	var symbol = settings.symbol;
	var term = settings.term;

	if (!financialDataContainerMap[containerId]) {
		financialDataContainerMap[containerId] = {};
		financialDataContainerMap[containerId].term = settings.terms[0];
		financialDataContainerMap[containerId].statementType = 'Income Statement';
	}

	financialDataContainerMap[containerId].symbol = symbol;



	if (!financialData[symbol]) {
		financialData[symbol] = {};
	}
	if (!financialData[symbol][term]) {
		financialData[symbol][term] = data;
	}



	if (term == financialDataContainerMap[containerId].term) {
		//containerObject.html('');
		$('#' + widgetId + '-loading').hide();
		//create navigation

		if (!$('#' + containerId + '-nav-type').length) {
			var typeList = ['Income Statement', 'Balance Sheet', 'Cash Flow'];
			var typeNavDiv = $('<div>').attr('id', containerId + '-nav-type').addClass('ciq-range-nav ciq-nav-stype');
			var typeNavList = $('<ul>');
			_.each(typeList, function (t, key) {
				var typeItem = $('<li statementType="' + t + '">' + t + '</li>');
				if (key == 0) typeItem.addClass('active');
				typeNavList.append(typeItem);
			});
			typeNavDiv.append(typeNavList);
			containerObject.append('<h3>Financials for ' + symbol + '</h3>')
			containerObject.append(typeNavDiv);

			$('#' + containerId + '-nav-type li').on('click', function () {
				$(this).parent().children().removeClass('active');
				$(this).addClass('active');
				showFinancialData($(this).parent().parent().parent(), {
					statementType: $(this).attr('statementType')
				});
			});

			var termNavDiv = $('<div>').attr('id', containerId + '-nav-term').addClass('ciq-range-nav ciq-nav-term');
			var termNavList = $('<ul>');
			_.each(settings.terms, function (t, key) {
				var termItem = $('<li term="' + t + '">' + t + '</li>');
				if (key == 0) termItem.addClass('active');
				termNavList.append(termItem);
			});
			termNavDiv.append(termNavList);
			containerObject.append(termNavDiv);

			containerObject.append($('<div style="clear:both">').attr('id', containerId + '-table-div'));

			$('#' + containerId).on('click', '#' + containerId + '-nav-term li', function () {
				$(this).parent().children().removeClass('active');
				$(this).addClass('active');
				showFinancialData($(this).parent().parent().parent(), {
					term: $(this).attr('term')
				});
			});

			$(window).resize(function () {
				showFinancialData(containerObject, {
					resize: true
				});
			})
		}

		showFinancialData(containerObject);


	}
}

function financials(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (widgetId, key) {
		var container = 'ciq-' + widgetId;
		var settings = portalSettings.items[widgetId];
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		if (xignite.isMutual(settings.symbol)) {
			containerObject.html('');
			return;
		}
		//if (!$('#' + widgetId + '-loading').length)
		containerObject.html('<div id="' + widgetId + '-loading">Loading..</div>');
		//else $('#' + widgetId + '-loading').show();
		dataSources[portalSettings.dataSource].fetchFinancialStatements(settings, financialsCallback, containerObject);
		containerObject.show();

		// send messages?
		var message = {
			sender: widgetId,
			subject: 'symbolChange',
			data: {
				symbol: settings.symbol
			}

		}
		PortalCore.sendMessage(message);

	});
	//PortalCore.addStyleSheet(cssUrl + 'modules/financials.css');
}