How to implement your own data feed into the news widget.

The important file here is xignite.js. You will need to implement each function you see in that file, but for your own data feed. Here is a brief description of what each function does:

- setXigniteEncryptedToken: this function sets and encrypts a valid token for your data feed. This function is frequently called, and it returns true if there is already a valid token available.

- makeUrl: this is a convenience function that formats your url correctly and can append args to the end as well.

- fetchMarketHeadlines: this function makes a call to xignite and returns headlines for the requested market as an object.

- fetchSecurityHeadlines: this function makes a call to xignite and returns headlines for the requested security as an object.

In general, you'll need to see how your data feed provides it's data and format it in a way that the news widget is expecting.