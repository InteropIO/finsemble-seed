import detect from "detect-csv";
import Ajv from "ajv";
import { default as fdc3ContextSchema } from "./schema/context.schema.json";
import { default as fdc3ContactSchema } from "./schema/contact.schema.json";
import { default as fdc3ContactListSchema } from "./schema/contactList.schema.json";
import { default as fdc3CountrySchema } from "./schema/country.schema.json";
import { default as fdc3InstrumentSchema } from "./schema/instrument.schema.json";
import { default as fdc3InstrumentListSchema } from "./schema/instrumentList.schema.json";
import { default as fdc3OrganizationSchema } from "./schema/organization.schema.json";
import { default as fdc3PortfolioSchema } from "./schema/portfolio.schema.json";
import { default as fdc3PositionSchema } from "./schema/position.schema.json";

export class ContentTypeDetecter {
  [index: string]: any;
  typeToDetect: string[];
  ajv: Ajv;
  constructor(typeToDetect: string[]) {
    this.typeToDetect = typeToDetect;
    this.ajv = new Ajv({
      schemas: [
        fdc3ContextSchema,
        fdc3ContactSchema,
        fdc3ContactListSchema,
        fdc3CountrySchema,
        fdc3InstrumentSchema,
        fdc3InstrumentListSchema,
        fdc3OrganizationSchema,
        fdc3PortfolioSchema,
        fdc3PositionSchema,
      ],
    });
  }

  detect(content: string): string {
    for (const type of this.typeToDetect) {
      let funcName = type.toLowerCase();
      if (typeof this[funcName] === "function")
        if (this[funcName].apply(this, [content])) {
          return type;
        }
    }
    return "STRING";
  }

  fdc3position(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3PositionSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3portfolio(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3PortfolioSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3organization(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3OrganizationSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3instrumentlist(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3InstrumentListSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3instrument(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3InstrumentSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3country(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3CountrySchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3contactlist(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3ContactListSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3contact(content: string): boolean {
    if (this.fdc3context(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3ContactSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  fdc3context(content: string): boolean {
    if (this.json(content)) {
      let jsonObj = JSON.parse(content);
      const validate = this.ajv.compile(fdc3ContextSchema);
      return validate(jsonObj);
    } else {
      return false;
    }
  }

  json(content: string): boolean {
    try {
      let jsonObj = JSON.parse(content);
      return typeof jsonObj === "object";
    } catch (e) {
      return false;
    }
  }

  sedol(content: string): boolean {
    content = content.trim().toUpperCase();
    if (content.length > 6) return false;

    var weight = [1, 3, 1, 7, 3, 9, 1];

    if (content.search(/^[0-9BCDFGHJKLMNPQRSTVWXYZ]{6}$/) == -1) return false;

    var sum = 0;
    for (var i = 0; i < content.length; i++)
      sum += weight[i] * parseInt(content.charAt(i), 36);
    var check = (10 - (sum % 10)) % 10;
    return true; //content + check.toString();
  }

  cusip(content: string): boolean {
    content = content.trim().toUpperCase();

    if (!/^[0-9A-Z@#*]{9}$/.test(content)) {
      return false;
    }

    var sum = 0,
      cusipChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ*@#".split("");

    var cusipLength = content.length - 1;

    for (var i = 0; i < cusipLength; i++) {
      var item = content[i];

      var code = item.charCodeAt(0),
        num,
        isChar = code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0);

      if (isChar) {
        num = cusipChars.indexOf(item) + 10;
      } else {
        num = Number(item);
      }

      if (i % 2 != 0) {
        num *= 2;
      }

      num = (num % 10) + Math.floor(num / 10);
      sum += num;
    }
    return (10 - (sum % 10)) % 10 === Number(content[content.length - 1]);
  }

  isin(content: string): boolean {
    let isin = content.trim().toUpperCase();
    if (!isin.match("^[A-Z]{2}[A-Z0-9]{9}\\d$")) return false;

    let strBase36 = "";
    for (let i = 0; i < content.length; i++) {
      strBase36 += parseInt(content[i], 36);
    }
    return this.luhnCheck(strBase36);
  }

  luhnCheck(str: string): boolean {
    {
      var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
      var counter = 0;
      var incNum;
      var odd = false;
      var temp = String(str).replace(/[^\d]/g, "");
      if (temp.length == 0) return false;
      for (var i = temp.length - 1; i >= 0; --i) {
        incNum = parseInt(temp.charAt(i), 10);
        counter += (odd = !odd) ? incNum : luhnArr[incNum];
      }
      return counter % 10 == 0;
    }
  }

  csv(content: string): boolean {
    return detect(content) ? true : false;
  }

  number(content: string): boolean {
    let numberPattern = /^\d+$/;
    if (content.match(numberPattern)) {
      return true;
    } else {
      return false;
    }
  }

  test(): void {
    let testcases = [];
    //testcases.push('')
    testcases.push("A1,B1,C1\nA2,B2,C2\nA3,B3,C3");
    testcases.push("123");
    testcases.push("456");
    testcases.push("test");
    testcases.push("test123");
    testcases.push('{"test": "test123", "test1":"test1"}');
    testcases.push('"123"');
    testcases.push("US0378331005");
    testcases.push("US0373831005");
    testcases.push("US0337833103");
    testcases.push("AU0000XVGZA3");
    testcases.push("AU0000VXGZA3");
    testcases.push("FR0000988040");
    testcases.push("037833100");
    testcases.push("17275R102");
    testcases.push("38259P508");
    testcases.push("594918104");
    testcases.push("68389X106");
    testcases.push("68389X105");
    testcases.push("710889");
    testcases.push("B0YBKJ");
    testcases.push("406566");
    testcases.push("B0YBLH");
    testcases.push("228276");
    testcases.push("B0YBKL");
    testcases.push("557910");
    testcases.push("B0YBKR");
    testcases.push("585284");
    testcases.push("B0YBKT");
    testcases.push("BOATER");
    testcases.push("12345");
    testcases.push("1234563");
    testcases.push("1234567");
    testcases.push(
      '{"type":"fdc3.contact","name":"John Smith","id":{"email":"john.smith@company.com"}}'
    );
    testcases.push(
      '{"type": "fdc3.contactList","name": "client list","contacts":[{"type":"fdc3.contact","name":"joe","id":{"email": "joe@company1.com"}},{"type":"fdc3.contact","name":"jane","id":{"email": "jane@company2.com"}}]}'
    );
    testcases.push(
      '{"type":"fdc3.country", "name":"the USA", "id":{"ISOALPHA2":"US","ISOALPHA3":"USA"}}'
    );
    testcases.push(
      '{"type":"fdc3.instrument","name":"Apple","id":{"ticker":"aapl","ISIN":"US0378331005","CUSIP":"037833100","FIGI":"BBG000B9XRY4"}}'
    );
    testcases.push('{"type": "fdc3.instrumentList","name" : "my portfolio","instruments" : [{"type" : "fdc3.instrument","name" : "Apple","id": {"ticker" : "aapl"}},{"type" : "fdc3.instrument","name" : "International Business Machines","id": {"ticker" : "ibm"} }]}');
    testcases.push('{"type": "fdc3.organization","name": "IBM","id": {"PERMID" : "4295904307","LEI" : "VGRQXHF3J8VDLUA7XE92"}}');
    testcases.push('{"type":"fdc3.portfolio","name":"my portfolio","positions":[{"type": "fdc3.position","instrument": {"type" : "fdc3.instrument","name" : "Apple","id" :{"ISIN" : "US0378331005"}},"holding": 500},{"type": "fdc3.position","instrument": {"type" : "fdc3.instrument","name" : "IBM","id" :{"ISIN" : "US4592001014"}},"holding": 1000}]}');
    testcases.push('{"type": "fdc3.position","instrument": {"type" : "fdc3.instrument","name" : "Apple","id" :{"ISIN" : "US0378331005" }},"holding": 500}');

    testcases.forEach((testcase: string) => {
      console.log(testcase, "\n", this.detect(testcase));
    });
  }
}
