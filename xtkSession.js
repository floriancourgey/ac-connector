var soap = require('soap'),
    ACCNLObject = require('./ACCNLObject').ACCNLObject
    xtkSessionWSDL = require.resolve('./wsdl/wsdl_xtksession.xml');

class xtkSession extends ACCNLObject {
  constructor ( options ){    
    options = options || {};
    options.wsdl = options.wsdl || xtkSessionWSDL;
    super( options );
  }

  Write( contentToSend ) {
   var promise = new Promise( (resolve, reject ) => {this.executeQueryResolve = resolve; this.executeQueryReject = reject;});
   var onLoaded = function( err, result, raw, soapHeader) {
          if(err)
            {
              this.executeQueryReject( err );
            }
              this.executeQueryResolve( result );
      }.bind(this)

    this.clientPromise.then(
    function( contentToSend ){
      this.client.Write({
        sessiontoken : this.accLogin.sessionToken,
        domDoc : {$xml : contentToSend} 
      },
        onLoaded
      )}.bind(this, contentToSend)
    );
    return promise;
  }
    
  GetEntityIfMoreRecent (/*String*/ pk, /*String*/ md5, /*Boolean*/ mustExist) {
    var promise = new Promise( (resolve, reject ) => {this.executeQueryResolve = resolve; this.executeQueryReject = reject;});
    var onLoaded = function(err, result, raw, soapHeader) {
      if(err){
        this.executeQueryReject(err);
      }
      this.executeQueryResolve(result.pdomDoc);
    }.bind(this);

    this.clientPromise.then(function(pk, md5, mustExist){
      this.client.GetEntityIfMoreRecent({
        sessiontoken : this.accLogin.sessionToken,
        pk : pk,
        md5 : md5,
        mustExist : mustExist,
      },
        onLoaded
      )}.bind(this, pk, md5, mustExist)
    );
    return promise;
  }
}

exports.xtkSession = xtkSession;
