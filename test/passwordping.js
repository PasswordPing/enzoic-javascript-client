var expect = require('chai').expect;
var PasswordPing = require('../passwordping.js');

//
// These are actually live tests and require a valid API key and Secret to be set in your environment variables.
// Set an env var for PP_API_KEY and PP_API_SECRET with the respective values prior to running the tests.
//
describe('PasswordPing', function() {
    describe('constructor', function() {
        it('throws exception on missing API key and Secret', function() {
            var error = false;
            try {
                new PasswordPing();
            }
            catch(e) {
                error = true;
                expect(e).to.equal('API key and Secret must be provided');
            }

            expect(error).to.equal(true);
        });

        it('instantiates correctly', function() {
           var passwordping = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET);
           expect(passwordping).to.be.a('Object');
           expect(passwordping).to.have.property('apiKey');
           expect(passwordping).to.have.property('secret');
           expect(passwordping.apiKey).to.equal(process.env.PP_API_KEY);
           expect(passwordping.secret).to.equal(process.env.PP_API_SECRET);
           expect(passwordping.host).to.equal('api.passwordping.com');
        });

        it('works with alternate base API host', function() {
            var passwordping = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET, 'api-alt.passwordping.com');
            expect(passwordping.host).to.equal('api-alt.passwordping.com');
        });
    });

    describe('#checkPassword()', function() {
        var passwordping = getPasswordPing();

        it('gets correct positive result', function(done) {
            passwordping.checkPassword('123456', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal(true);
                done();
            });
        });

        it('gets correct negative result', function(done) {
           passwordping.checkPassword('kjdlkjdlksjdlskjdlskjslkjdslkdjslkdjslkd', function(err, result) {
               expect(err).to.equal(null);
               expect(result).to.equal(false);
               done();
           });
        });

        it('handles errors properly', function(done) {
            var bogusServer = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET, 'bogus.passwordping.com');

            bogusServer.checkPassword('123456', function (err, result) {
                expect(err).to.equal('Unexpected error calling PasswordPing API: getaddrinfo ENOTFOUND bogus.passwordping.com bogus.passwordping.com:443');
                done();
            });
        });
    });

    describe('#checkCredentials()', function() {
        var passwordping = getPasswordPing();

       it('gets correct positive result', function(done) {
            passwordping.checkCredentials('test@passwordping.com', '123456', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal(true);
                done();
            });
       });

       it('gets correct negative result', function(done) {
            passwordping.checkCredentials('test@passwordping.com', '123456122', function(err, result) {
               expect(err).to.equal(null);
               expect(result).to.equal(false);
               done();
            });
       });

        it('handles errors properly', function(done) {
            var bogusServer = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET, 'bogus.passwordping.com');

            bogusServer.checkCredentials('test@passwordping.com', '123456', function (err, result) {
                expect(err).to.equal('Unexpected error calling PasswordPing API: getaddrinfo ENOTFOUND bogus.passwordping.com bogus.passwordping.com:443');
                done();
            });
        });
    });

    describe('#getExposuresForUser()', function(done) {
        var passwordping = getPasswordPing();

        it('gets correct result', function(done) {
            passwordping.getExposuresForUser('eicar', function(err, result) {
                expect(err).to.equal(null);
                expect(result.count).to.equal(4);
                expect(result.exposures.length).to.equal(4);
                expect(result.exposures).to.deep.equal(["5820469ffdb8780510b329cc", "58258f5efdb8780be88c2c5d", "582a8e51fdb87806acc426ff", "583d2f9e1395c81f4cfa3479"]);
                done();
            });
        });

        it('handles negative result correctly', function(done) {
            passwordping.getExposuresForUser('@@bogus-username@@', function(err, result) {
               expect(err).to.equal(null);
               expect(result.count).to.equal(0);
               expect(result.exposures.length).to.equal(0);
               done();
            });
        });

        it('handles error properly', function(done) {
            var bogusServer = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET, 'bogus.passwordping.com');

            bogusServer.getExposuresForUser('eicar', function (err, result) {
                expect(err).to.equal('Unexpected error calling PasswordPing API: getaddrinfo ENOTFOUND bogus.passwordping.com bogus.passwordping.com:443');
                done();
            });
        });
    });

    describe('#getExposureDetails()', function() {
        var passwordping = getPasswordPing();

        it('gets correct result', function(done) {
            passwordping.getExposureDetails('5820469ffdb8780510b329cc', function (err, result) {
                expect(err).to.equal(null);
                expect(result).to.deep.equal({
                    id: "5820469ffdb8780510b329cc",
                    title: "last.fm",
                    category: "Music",
                    date: "2012-03-01T00:00:00.000Z",
                    dateAdded: "2016-11-07T09:17:19.000Z",
                    passwordType: "MD5",
                    exposedData: ["Emails", "Passwords", "Usernames", "Website Activity"],
                    entries: 43570999,
                    domainsAffected: 1218513,
                    sourceURLs: []
                });
                done();
            });
        });

        it('handles negative result correctly', function(done) {
            passwordping.getExposureDetails("111111111111111111111111", function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal(null);
                done();
            });
        });

        it('handles error properly', function(done) {
            var bogusServer = new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET, 'bogus.passwordping.com');

            bogusServer.getExposureDetails('5820469ffdb8780510b329cc', function (err, result) {
                expect(err).to.equal('Unexpected error calling PasswordPing API: getaddrinfo ENOTFOUND bogus.passwordping.com bogus.passwordping.com:443');
                done();
            });
        });
    });

    describe('#calcPasswordHash()', function() {
        var passwordping = getPasswordPing();

        it('MD5 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.MD5, '123456', null, function(err, result) {
                expect(err).to.equal(null);
               expect(result).to.equal('e10adc3949ba59abbe56e057f20f883e');
               done();
            });
        });

        it('SHA1 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.SHA1, '123456', null, function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('7c4a8d09ca3762af61e59520943dc26494f8941b');
                done();
            });
        });

        it('SHA256 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.SHA256, '123456', null, function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
                done();
            });
        });

        it('IPBoard_MyBB works', function(done) {
            passwordping.calcPasswordHash(PasswordType.IPBoard_MyBB, '123456', ';;!_X', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('2e705e174e9df3e2c8aaa30297aa6d74');
                done();
            });
        });

        it('VBulletin works', function(done) {
            passwordping.calcPasswordHash(PasswordType.VBulletinPost3_8_5, '123456789', ']G@', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('57ce303cdf1ad28944d43454cea38d7a');
                done();
            });
        });

        it('BCrypt works', function(done) {
            passwordping.calcPasswordHash(PasswordType.BCrypt, '12345', '$2a$12$2bULeXwv2H34SXkT1giCZe', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('$2a$12$2bULeXwv2H34SXkT1giCZeJW7A6Q0Yfas09wOCxoIC44fDTYq44Mm');
                done();
            });
        });

        it('CRC32 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.CRC32, '123456', null, function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('0972d361');
                done();
            });
        });

        it('PHPBB3 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.PHPBB3, '123456789', '$H$993WP3hbz', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('$H$993WP3hbzy0N22X06wxrCc3800D2p41');
                done();
            });
        });

        it('CustomAlgorithm1 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.CustomAlgorithm1, '123456', '00new00', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('cee66db36504915f48b2d545803a4494bb1b76b6e9d8ba8c0e6083ff9b281abdef31f6172548fdcde4000e903c5a98a1178c414f7dbf44cffc001aee8e1fe206');
                done();
            });
        });

        it('CustomAlgorithm2 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.CustomAlgorithm2, '123456', '123', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('579d9ec9d0c3d687aaa91289ac2854e4');
                done();
            });
        });

        it('SHA512 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.SHA512, 'test', null, function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff');
                done();
            });
        });

        it('MD5Crypt works', function(done) {
            passwordping.calcPasswordHash(PasswordType.MD5Crypt, '123456', '$1$4d3c09ea', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('$1$4d3c09ea$hPwyka2ToWFbLTOq.yFjf.');
                done();
            });
        });

        it('CustomAlgorithm4 works', function(done) {
            passwordping.calcPasswordHash(PasswordType.CustomAlgorithm4, '1234', '$2y$12$Yjk3YjIzYWIxNDg0YWMzZO', function(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('$2y$12$Yjk3YjIzYWIxNDg0YWMzZOpp/eAMuWCD3UwX1oYgRlC1ci4Al970W');
                done();
            });
        });
    });
});

function getPasswordPing() {
    return new PasswordPing(process.env.PP_API_KEY, process.env.PP_API_SECRET);
}