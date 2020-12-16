# OpenPath Apple Pay

Basic Example

```
            // attached elements
            OpenPath.ApplePay.AttachApplePayButton('.apple-pay-button');

            // attach endpoints
            OpenPath.ApplePay.AttachValidateMerchantEndpoint('/apple-pay/validate-merchant');
            OpenPath.ApplePay.AttachShippingContactSelectedEndpoint('/apple-pay/shipping-contact');
            OpenPath.ApplePay.AttachPaymentMethodSelectedEndpoint('/apple-pay/payment-method');
            OpenPath.ApplePay.AttachShippingMethodSelectedEndpoint('/apple-pay/shipping-method');
            OpenPath.ApplePay.AttachPaymentAuthorizedEndpoint('/apple-pay/payment-authorized');

            // set excepted credit card networks
            OpenPath.ApplePay.AmericanExpress(true);
            OpenPath.ApplePay.Discover(true);
            OpenPath.ApplePay.MasterCard(true);
            OpenPath.ApplePay.Visa(true);

            // set line items
            OpenPath.ApplePay.SetCountryCode("US");
            OpenPath.ApplePay.ClearLineItems();
            OpenPath.ApplePay.SetTotal('Store Name', 10.00);

            // show the apple pay button if supported
            OpenPath.ApplePay.ShowApplePayButton();
            
```
