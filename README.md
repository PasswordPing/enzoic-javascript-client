# PasswordPing JavaScript Client Library

## TOC

This README covers the following topics:

- [Installation](#installation)
- [API Overview](#api-overview)
- [The PasswordPing constructor](#the-passwordping-constructor)

## Installation

```sh
$ npm install passwordping
```

## API Overview

Below is some simple example code which demonstrates the usage of the API. 

```js
var PasswordPing = require('passwordping');

// Create a new PasswordPing instance - this is our primary interface for making API calls
var passwordping = new PasswordPing(YOUR_API_KEY, YOUR_API_SECRET);

// Check whether a password has been compromised
passwordping.checkPassword('password-to-test', 
    (error, passwordCompromised) => {
        if (error) {
            console.log('Error calling API: ' + error);
        }
        else if (passwordCompromised === true) {
            console.log('Password is compromised');
        }
        else {
            console.log('Password is not compromised');
        }
    });

// Check whether a specific set of credentials are compromised
passwordping.checkCredentials('test@passwordping.com', 'password-to-test', 
    (error, credsCompromised) => {
        if (error) {
            console.log('Error calling API: ' + error);
        }
        else if (credsCompromised === true) {
            console.log('Credentials are compromised');
        }
        else {
            console.log('Credentials are not compromised');
        }
    });

// Enhanced version of checkCredentials offering more control over performance.
// The call introduces an options object parameter, which supports the following settings:
//
// lastCheckDate: 
// The timestamp for the last check you performed for this user.
// If the date/time you provide for the last check is greater than the timestamp PasswordPing has for the last
// breach affecting this user, the check will not be performed.  This can be used to substantially increase performance.
//
// excludeHashAlgorithms: 
// An array of PasswordTypes to ignore when calculating hashes for the credentials check.   
// By excluding computationally expensive PasswordTypes, such as BCrypt, it is possible to balance the performance of this
// call against security.
//
passwordping.checkCredentialsEx('test@passwordping.com', 'password-to-test', 
    {
        lastCheckDate: new Date('2016-12-10T02:05:03.000Z'), 
        excludeHashAlgorithms: [8, 11, 12] // see https://www.passwordping.com/docs-credentials-api/#PasswordHashType 
    },
    (error, credsCompromised) => {
        if (error) {
            console.log('Error calling API: ' + error);
        }
        else if (credsCompromised === true) {
            console.log('Credentials are compromised');
        }
        else {
            console.log('Credentials are not compromised');
        }
    });

// get all exposures for the given user
passwordping.getExposuresForUser('test@passwordping.com', 
    (error, result) => {
        if (error) {
            console.log('Error calling API: ' + error);
        }
        else {
            console.log(result.exposures.count + ' exposures found for test@passwordping.com');
    
            // now get the full details for the first exposure returned in the list
            passwordping.getExposureDetails(result.exposures[0], 
                (error, exposureDetails) => {
                    if (error) {
                        console.log('Error calling API: ' + error);
                    }
                    else {
                        console.log('First exposure for test@passwordping.com was ' + exposureDetails.title);
                    }
                });
        }
    });

// get all exposures for a given domain - second parameter indicates whether to include exposure details in results
passwordping.getExposuresForDomain('passwordping.com', true, 
    (error, result) => {
        if (error) {
            console.log('Error calling API: ' + error);
        }
        else {
            console.log(result.exposures.count + ' exposures found for passwordping.com');
            
            if (result.exposures.count > 0) {
                console.log('First exposure for passwordping.com was ' + result.exposures[0].title);
            }
        }
    });

// get all users exposed for a given domain
// returns paged results per https://www.passwordping.com/docs-exposures-api/#get-exposed-users-for-domain
passwordping.getExposedUsersForDomain('passwordping.com', 20, null, 
    (error, exposedUsers) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           // print first page of results
           for (var i = 0; i < exposedUsers.users.length; i++) {
               console.log('Exposed User: ' + exposedUsers.users[i].username + '\n');
           }
           
           // if pagingToken present, get next page of results
           if (exposedUsers.pagingToken) {
                passwordping.getExposedUsersForDomain('passwordping.com', 20, exposedUsers.pagingToken, 
                    (error, secondPageResponse) => {
                        // process second page of results, etc.
                    });   
           }
       }    
    });

// SHA256 hashes of a couple of email addresses
var arrUsernameSHA256Hashes = [
    'd56cdba2a920248f6487eb5a951013fcb9e4752a2ba5f1fa61ef8d235c44351e', 
    '006ddca2a920248f6487eb5a951013fcb9e4752a2ba5f1fa61ef8d235c44356e'
];

// subscribe for alerts for these users
passwordping.addUserAlertSubscriptions(arrUsernameSHA256Hashes, 
    (error, addResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           console.log('New subscriptions added: ' + addResponse.added + '\n' + 
                'Subscriptions already existing: ' + addResponse.alreadyExisted);
       }
    });

// delete subscriptions for these users
passwordping.deleteUserAlertSubscriptions(arrUsernameSHA256Hashes, 
    (error, deleteResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           console.log('Subscriptions deleted: ' + deleteResponse.deleted + '\n' + 
                'Subscriptions not found: ' + deleteResponse.notFound);
       }
    });

// check whether a user is already subscribed
passwordping.isUserSubscribedForAlerts(arrUsernameSHA256Hashes[0], 
    (error, subscribed) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else if (subscribed === true) {
           console.log('User already subscribed');
       }
       else {
           console.log('User not already subscribed');
       }    
    });

// get all users subscribed for alerts on this account 
// returns paged results per https://www.passwordping.com/docs-exposure-alerts-service-api/#get-exposure-subscriptions
passwordping.getUserAlertSubscriptions(4 /* page size */, null /* paging token - null on first call */, 
    (error, subscriptionsResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           // print first page of results
           for (var i = 0; i < subscriptionsResponse.usernameHashes.length; i++) {
               console.log('Username Hash: ' + subscriptionsResponse.usernameHashes[i] + '\n');
           }
           
           // if pagingToken present, get next page of results
           if (subscriptionsResponse.pagingToken) {
                passwordping.getUserAlertSubscriptions(4, subscriptionsResponse.pagingToken, function (error, secondPageResponse) {
                    // process second page of results, etc.
                });   
           }
       }    
    });

// test domains for alert subscriptions
var arrDomains = [
    'testdomain1.com', 
    'testdomain2.com' 
];

// subscribe for alerts for these domains
passwordping.addDomainAlertSubscriptions(arrDomains, 
    (error, addResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           console.log('New subscriptions added: ' + addResponse.added + '\n' + 
                'Subscriptions already existing: ' + addResponse.alreadyExisted);
       }
    });

// delete subscriptions for these domains
passwordping.deleteDomainAlertSubscriptions(arrDomains, 
    (error, deleteResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           console.log('Subscriptions deleted: ' + deleteResponse.deleted + '\n' + 
                'Subscriptions not found: ' + deleteResponse.notFound);
       }
    });

// check whether a domain is already subscribed
passwordping.isDomainSubscribedForAlerts(arrDomains[0], 
    (error, subscribed) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else if (subscribed === true) {
           console.log('Domain already subscribed');
       }
       else {
           console.log('Domain not already subscribed');
       }    
    });

// get all users subscribed for alerts on this account 
// returns pages results per https://www.passwordping.com/docs-exposure-alerts-service-api/#get-exposure-subscriptions-domains
passwordping.getDomainAlertSubscriptions(4 /* page size */, null /* paging token - null on first call */, 
    (error, subscriptionsResponse) => {
       if (error) {
           console.log('Error calling API: ' + error);
       } 
       else {
           // print first page of results
           for (var i = 0; i < subscriptionsResponse.domains.length; i++) {
               console.log('Domain: ' + subscriptionsResponse.domains[i] + '\n');
           }
           
           // if pagingToken present, get next page of results
           if (subscriptionsResponse.pagingToken) {
                passwordping.getDomainAlertSubscriptions(4, subscriptionsResponse.pagingToken, function (error, secondPageResponse) {
                    // process second page of results, etc.
                });   
           }
       }    
    });

```

More information in reference format can be found below.

## The PasswordPing constructor

The standard constructor takes the API key and secret you were issued on PasswordPing signup.

```js
var passwordping = new PasswordPing(YOUR_API_KEY, YOUR_API_SECRET);
```

If you were instructed to use an alternate API host, you may call the overloaded constructor and pass the host you were provided.

```js
var passwordping = new PasswordPing(YOUR_API_KEY, YOUR_API_SECRET, "api-alt.passwordping.com");
```
