
var OpenPath = {

    ApplePay: {



        // ATTACHED ELEMENTS
        // ================================================================================
        AttachApplePayButton: function (idOrClass) {
            this.applePayButtonElement = idOrClass;
        },
        AttachLog: function (idOrClass) {
            this.applePayLogElement = idOrClass;
        },
        // default element attributes
        // --------------------------------------------------------------------------------
        applePayButtonElement: ".apple-pay-button",
        applePayLogElement:    ".apple-pay-log",



        // ATTACHED ENDPOINTS
        // ================================================================================
        AttachValidateMerchantEndpoint: function (endpoint) {
            this.validateMerchantEndpoint = endpoint;
        },
        AttachPaymentMethodSelectedEndpoint: function (endpoint) {
            this.paymentMethodSelectedEndpoint = endpoint;
        },
        AttachShippingMethodSelectedEndpoint: function (endpoint) {
            this.shippingMethodSelectedEndpoint = endpoint;
        },
        AttachShippingContactSelectedEndpoint: function (endpoint) {
            this.shippingContactSelectedEndpoint = endpoint;
        },
        AttachPaymentAuthorizedEndpoint: function (endpoint) {
            this.paymentAuthorizedEndpoint = endpoint;
        },

        SetShopifyRequestValues: function (requestBody) {
            this.shopifyRequestValues = JSON.parse(requestBody);
        },
        // default endpoint attributes
        // --------------------------------------------------------------------------------
        validateMerchantEndpoint:        "/applepay/validate",
        paymentMethodSelectedEndpoint:   "/applepay/payment_method",
        shippingMethodSelectedEndpoint:  "/v1/applepay/shipping_method",
        shippingContactSelectedEndpoint: "/v1/applepay/shipping_contact",
        paymentAuthorizedEndpoint:       "/applepay/payment_authorized",

        shopifyRequestValues: {},
        // APPLE PAY BUTTON FUNCTIONS
        // ================================================================================
        ShowApplePayButton: function () {
            OpenPath.ApplePay.Log("Showing Apple Pay Button");

            try {

                if (window.ApplePaySession && ApplePaySession.canMakePayments()) {

                    var button = $(this.applePayButtonElement);
                    var language = $("html").attr("lang") || "en";
                    var buttonStyle = "-webkit-appearance: -apple-pay-button;" +
                        "-apple-pay-button-type: plain;" +
                        "-apple-pay-button-style: black;";

                    button.attr("lang", language);
                    button.on("click", OpenPath.ApplePay.BeginPayment);

                    if ("openPaymentSetup" in ApplePaySession) {

                        button.attr("style", buttonStyle);

                    }
                    else {

                        button.attr("style", buttonStyle);

                    }

                    $(this.applePayButtonElement).show();

                }
                else {

                    $(this.applePayButtonElement).hide();

                }

            }
            catch (err) {
                OpenPath.ApplePay.Log(err.message);
            }

        },



        // APPLE PAY PAYMENT FUNCTIONS
        // ================================================================================
        BeginPayment: function (e) {

            e.preventDefault();

            OpenPath.ApplePay.Log("Apple Pay Button Clicked");

            try {

                // create the apple pay session
                var session = new ApplePaySession(6, OpenPath.ApplePay.ApplePayPaymentRequest());


                // validate the merchant and create the payment information
                // --------------------------------------------------------------------------------
                session.onvalidatemerchant = function (event) {

                    OpenPath.ApplePay.Log("Validating Merchant");

                    try {

                        // create the payload
                        var data = {
                            validationUrl: event.validationURL
                        };

                        // setup antiforgery http header
                        var antiforgeryHeader = $("meta[name='x-antiforgery-name']").attr("content");
                        var antiforgeryToken = $("meta[name='x-antiforgery-token']").attr("content");
                        var headers = {};

                        headers[antiforgeryHeader] = antiforgeryToken;

                        // post the payload to the server to validate the merchant
                        // session using the merchant certificate
                        $.ajax({
                            url:         OpenPath.ApplePay.validateMerchantEndpoint,
                            method:      "POST",
                            contentType: "application/json; charset=utf-8",
                            data:        JSON.stringify(data),
                            headers:     headers
                        }).then(function (data) {

                            if (data.success) {
                                // complete validation by passing the merchant session to the apple pay session
                                session.completeMerchantValidation(data.merchantSession);

                            }
                            else {

                                OpenPath.ApplePay.Log(data.error);

                            }

                        });

                    }
                    catch (err) {
                        OpenPath.ApplePay.Log(err.message);
                    }

                };


                // what to do when the payment method is changed
                // --------------------------------------------------------------------------------
                //session.onpaymentmethodselected = function (event) {

                //    OpenPath.ApplePay.Log("Payment Method Selected");

                //    try {

                //        var update = {};
                //        var postData = {
                //            paymentMethod: event.paymentMethod,
                //            update: {
                //                newTotal: OpenPath.ApplePay.total,
                //                newLineItems: OpenPath.ApplePay.paymentLineItems
                //            }
                //        };

                //        // setup antiforgery http header
                //        var antiforgeryHeader = $("meta[name='x-antiforgery-name']").attr("content");
                //        var antiforgeryToken = $("meta[name='x-antiforgery-token']").attr("content");
                //        var headers = {};

                //        headers[antiforgeryHeader] = antiforgeryToken;

                //        // post the payment to openpath
                //        $.ajax({
                //            url:         OpenPath.ApplePay.paymentMethodSelectedEndpoint,
                //            method:      "POST",
                //            contentType: "application/json; charset=utf-8",
                //            data:        JSON.stringify(postData),
                //            async:       true,
                //            headers: headers,
                //            complete: function (data) {

                //                var response = JSON.parse(data.responseText);

                //                if (response.success) {

                //                    session.completePaymentMethodSelection(response.update);

                //                }
                //                else {

                //                    update = {
                //                        newTotal: {
                //                            label: OpenPath.ApplePay.total.label,
                //                            amount: OpenPath.ApplePay.total.amount,
                //                            type: OpenPath.ApplePay.total.type
                //                        }
                //                    };

                //                }

                //            }

                //        });

                //    } catch (err) {
                //        OpenPath.ApplePay.Log(err.message);
                //    }

                //};


                

                // what to do when the payment has been authorized
                // --------------------------------------------------------------------------------
                session.onpaymentauthorized = function (event) {

                    OpenPath.ApplePay.Log("Payment Authorized");
                    OpenPath.ApplePay.Log("payment");
                    OpenPath.ApplePay.Log(JSON.stringify(event.payment));
                    OpenPath.ApplePay.Log("payment.token.paymentData");
                    OpenPath.ApplePay.Log(JSON.stringify(event.payment.token.paymentData));

                    try {

                        // get the base64-encoded string of the paymentData for gateways
                        //var base64String = btoa(JSON.stringify(event.payment.token.paymentData));
                        //var uIntArray    = Uint8Array.from(base64String, c => c.charCodeAt(0));
                        //var hexString    = OpenPath.ApplePay.ByteToHexString(uIntArray);

                        //event.payment.paymentData = hexString;
                        var paymentPacket = {
                            paymentDto : event.payment,
                            shopifyRequestValues: OpenPath.ApplePay.shopifyRequestValues
                        }
                       
                        // post the payment to openpath
                        $.ajax({
                            url:         OpenPath.ApplePay.paymentAuthorizedEndpoint,
                            method:      "POST",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(paymentPacket)
                        }).then(function (data) {

                            if (data !== '') {

                                session.completePayment(ApplePaySession.STATUS_SUCCESS);
                                setTimeout(function () {
                                    window.location.href = data
                                }, 3000);

                            }
                            else {

                                session.completePayment(ApplePaySession.STATUS_FAILURE);

                            }

                        });


                    } catch (err) {
                        OpenPath.ApplePay.Log(err.message);
                    }

                };



                // what to do when the shipping information is changed
                // --------------------------------------------------------------------------------
                //session.onshippingcontactselected = function (event) {

                //    // LOGGING
                //    OpenPath.ApplePay.Log("Shipping Contact Selected");
                //    try {
                       
                //        var update = {};
                //        var postData = {
                //            shippingContact: event.shippingContact,
                            
                //            update: {
                //                newTotal: OpenPath.ApplePay.total,
                //                newLineItems: OpenPath.ApplePay.paymentLineItems
                //            }
                //        };
                //        // setup antiforgery http header
                //        var antiforgeryHeader = $("meta[name='x-antiforgery-name']").attr("content");
                //        var antiforgeryToken = $("meta[name='x-antiforgery-token']").attr("content");
                //        var headers = {};

                //        headers[antiforgeryHeader] = antiforgeryToken;

                //        // post the payment to openpath
                //        $.ajax({
                //            url: OpenPath.ApplePay.shippingContactSelectedEndpoint,
                //            method: "POST",
                //            contentType: "application/json; charset=utf-8",
                //            data: JSON.stringify(postData),
                //            async: true,
                //            headers: headers,
                //            complete: function (data) {

                //                var response = JSON.parse(data.responseText);

                //                if (response.success) {
                //                    session.completeShippingContactSelection(response.update);

                //                }
                //                else {

                //                    update = {
                //                        newTotal: {
                //                            label: OpenPath.ApplePay.total.label,
                //                            amount: OpenPath.ApplePay.total.amount,
                //                            type: OpenPath.ApplePay.total.type
                //                        }
                //                    };

                //                }

                //            }

                //        });

                //    } catch (err) {
                //        OpenPath.ApplePay.Log(err.message);
                //    }

                //};

                // what to do when the shipping method is changed
                // --------------------------------------------------------------------------------
                //session.onshippingmethodselected = function (event) {

                //    OpenPath.ApplePay.Log("Shipping Method Selected");

                //    try {

                //        var update = {};
                //        var postData = {
                //            paymentMethod: event.shippingMethod,
                //            update: {
                //                newTotal: OpenPath.ApplePay.total,
                //                newLineItems: OpenPath.ApplePay.paymentLineItems
                //            }
                //        };

                //        // setup antiforgery http header
                //        var antiforgeryHeader = $("meta[name='x-antiforgery-name']").attr("content");
                //        var antiforgeryToken = $("meta[name='x-antiforgery-token']").attr("content");
                //        var headers = {};

                //        headers[antiforgeryHeader] = antiforgeryToken;

                //        // post the payment to openpath
                //        $.ajax({
                //            url: OpenPath.ApplePay.shippingMethodSelectedEndpoint,
                //            method: "POST",
                //            contentType: "application/json; charset=utf-8",
                //            data: JSON.stringify(postData),
                //            async: true,
                //            headers: headers,
                //            complete: function (data) {

                //                var response = JSON.parse(data.responseText);

                //                if (response.success) {

                //                    session.completeShippingMethodSelection(response.update);

                //                }
                //                else {

                //                    update = {
                //                        newTotal: {
                //                            label: OpenPath.ApplePay.total.label,
                //                            amount: OpenPath.ApplePay.total.amount,
                //                            type: OpenPath.ApplePay.total.type
                //                        }
                //                    };

                //                }

                //            }

                //        });

                //    } catch (err) {
                //        OpenPath.ApplePay.Log(err.message);
                //    }

                //};

                // start the session to display the apple pay sheet
                session.begin();

            }
            catch (err) {
                OpenPath.ApplePay.Log(err.message);
            }

        },


        // apple pay payment request functions
        // --------------------------------------------------------------------------------

        // get the payment information
        ApplePayPaymentRequest: function () {

            var paymentRequest = {
                countryCode:                    this.countryCode,
                currencyCode:                   this.currencyCode,
                merchantCapabilities:           ["supports3DS"],
                supportedNetworks:              this.supportedNetworks,
                requiredShippingAddressFields :  [],
                requiredBillingContactFields:   this.requiredBillingContactFields,
                shippingMethods:                this.shippingMethods,
                total:                          this.total
            };

            return paymentRequest;

        },

        // set the country
        SetCountryCode: function(country) {

            this.countryCode = country;

            switch (country) {
                case "US": this.currencyCode = "USD"; break;
                case "GB": this.currencyCode = "GBP"; break;
            }

        },

        // set the supported payment methods
        Visa:            function (supported) { this.SupportNetwork("visa",       supported); },
        MasterCard:      function (supported) { this.SupportNetwork("masterCard", supported); },
        AmericanExpress: function (supported) { this.SupportNetwork("amex",       supported); },
        Discover:        function (supported) { this.SupportNetwork("discover",   supported); },

        SupportNetwork: function (network, supported) {
            if (supported && !this.supportedNetworks.includes(network)) {
                this.supportedNetworks.push(network);
            }
            if (!supported && this.supportedNetworks.includes(network)) {
                this.supportedNetworks.splice(this.supportedNetworks.indexOf(network), 1);
            }
        },

        // set the total
        SetTotal: function (label, amount) {

            this.total.label  = label;
            this.total.amount = amount;

        },

        // line items
        ClearLineItems: function () {
            this.paymentLineItems = [];
        },
        AddLineItem: function (label, amount) {
            this.paymentLineItems.push({
                label: label,
                type: "final",
                amount: amount
            });
        },

        // base payment attributes
        countryCode:            "US",
        currencyCode:           "USD",
        merchantCapabilities:   ["supports3DS"],
        supportedNetworks:      [],
        total:                  {
                                    label: "Total",
                                    type: "final",
                                    amount: 0.00
        },
        paymentLineItems: [
            {
                label: "Subtotal",
                amount: 0.00,
                type: "final"
            }
        ],



        // SHIPPING METHODS
        // ================================================================================
        ClearShippingMethod: function () {
            this.shippingMethods = [];
        },
        //AddShippingMethod: function (label, amount, identifier, detail) {
        //    this.shippingMethods.push({ label: label, amount: amount, identifier: identifier, detail: detail });
        //},

        // shipping method attributes
        //shippingMethods: [],


        // SHIPPING FIELDS
        // ================================================================================
        //RequireShippingContactEmail:   function (supported) { this.RequiredShippingContactFields("email",         supported); },
        //RequireShippingContactName:    function (supported) { this.RequiredShippingContactFields("name",          supported); },
        //RequireShippingContactPhone:   function (supported) { this.RequiredShippingContactFields("phone",         supported); },
        //RequireShippingContactAddress: function (supported) { this.RequiredShippingContactFields("postalAddress", supported); },

        //RequiredShippingContactFields: function (field, required) {
        //    if (required && !this.requiredShippingContactFields.includes(field)) {
        //        this.requiredShippingContactFields.push(field);
        //    }
        //    if (!required && this.requiredShippingContactFields.includes(field)) {
        //        this.requiredShippingContactFields.splice(this.requiredShippingContactFields.indexOf(field), 1);
        //    }
        //},

        // BILLING FIELDS
        // ================================================================================
        RequireBillingContactEmail: function (supported) { this.RequiredBillingContactFields("email", supported); },
        RequireBillingContactName: function (supported) { this.RequiredBillingContactFields("name", supported); },
        RequireBillingContactPhone: function (supported) { this.RequiredBillingContactFields("phone", supported); },
        RequireBillingContactAddress: function (supported) { this.RequiredBillingContactFields("postalAddress", supported); },

        RequiredBillingContactFields: function (field, required) {
            if (required && !this.requiredBillingContactFields.includes(field)) {
                this.requiredBillingContactFields.push(field);
            }
            if (!required && this.requiredBillingContactFields.includes(field)) {
                this.requiredBillingContactFields.splice(this.requiredBillingContactFields.indexOf(field), 1);
            }
        },

        // default shipping field attributes
        requiredShippingContactFields: [],
        requiredBillingContactFields: ["email", "name", "phone", "postalAddress"],

        Log: function (message) {
            console.log(message);
            var html = $(this.applePayLogElement).html() + message + "<br />";
            $(this.applePayLogElement).html(html);
        },

        ByteToHexString: function(uint8arr) {

            if (!uint8arr) {
               return '';
            }

            var hexStr = '';

            for (var i = 0; i < uint8arr.length; i++) {
                var hex = (uint8arr[i] & 0xff).toString(16);
                hex = (hex.length === 1) ? '0' + hex : hex;
                hexStr += hex;
            }

            return hexStr.toUpperCase();

        }
        
    }

};