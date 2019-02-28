var soap = require('soap'),
    JXON = require('jxon'),
    ACCNLObject = require('./ACCNLObject').ACCNLObject;
    xtkQueryDefWSDL = require.resolve('./wsdl/wsdl_xtkquerydef.xml');

class xtkQueryDef extends ACCNLObject {
  constructor (options){
    options = options || {};
    options.wsdl = options.wsdl || xtkQueryDefWSDL;
    super(options);
  }
  ExecuteQuery(query){
    var promise = new Promise( (resolve, reject ) => {this.executeQueryResolve = resolve; this.executeQueryReject = reject;})
    var onLoaded = function( err, result, raw, soapHeader ){
      if(err) {
        return this.executeQueryReject( err );
      }
      
      if(this.options.outputFormat && this.options.outputFormat.toString().toLowerCase() == "raw"){
        this.executeQueryResolve(raw);
      } else if(this.options.outputFormat && this.options.outputFormat.toString().toUpperCase() == "XML") {
        var jxonVersion = JXON.stringToJs(raw);
        jxonVersion = jxonVersion['SOAP-ENV:Envelope']['SOAP-ENV:Body'].ExecuteQueryResponse.pdomOutput;
        this.executeQueryResolve( JXON.jsToXml({result : jxonVersion}) );
      } else {
        this.executeQueryResolve( result.pdomOutput );
      }

    }.bind( this );

    this.clientPromise.then(
    function( query ){
      this.client.ExecuteQuery({
        sessiontoken : this.accLogin.sessionToken,
        domDoc : {$xml : query}
      },
        onLoaded
      )}.bind(this, query)
    );
    return promise;
  }
}

exports.xtkQueryDef = xtkQueryDef;
