/*
 * pmrpc 0.5 - Inter-widget remote procedure call library based on HTML5 
 *             postMessage API and JSON-RPC. http://code.google.com/p/pmrpc
 *
 * Copyright 2009 Ivan Zuzak, Marko Ivankovic
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

pmrpc = self.pmrpc =  function() {
  // check if JSON library is available
  if (typeof JSON === "undefined" || typeof JSON.stringify === "undefined" || 
      typeof JSON.parse === "undefined") {
    throw "pmrpc requires the JSON library";
  }
  
  // check if postMessage APIs are available
  if (typeof this.postMessage === "undefined" &&  // window or worker
        typeof this.onconnect === "undefined") {  // shared worker
      throw "pmrpc requires the HTML5 cross-document messaging and worker APIs";
  }
    
  // Generates a version 4 UUID
  function generateUUID() {
    var uuid = [], nineteen = "89AB", hex = "0123456789ABCDEF";
    for (var i=0; i<36; i++) {
      uuid[i] = hex[Math.floor(Math.random() * 16)];
    }
    uuid[14] = '4';
    uuid[19] = nineteen[Math.floor(Math.random() * 4)];
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    return uuid.join('');
  }
  
  // Converts a wildcard expression into a regular expression
  function convertWildcardToRegex(wildcardExpression) {
    var regex = wildcardExpression.replace(
                  /([\^\$\.\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, "\\$1");
    regex = "^" + regex.replace(/\*/g, ".*") + "$";
    return regex;
  }
  
  // Checks whether a domain satisfies the access control list. The access 
  // control list has a whitelist and a blacklist. In order to satisfy the acl, 
  // the domain must be on the whitelist, and must not be on the blacklist.
  function checkACL(accessControlList, origin) {
    var aclWhitelist = accessControlList.whitelist;
    var aclBlacklist = accessControlList.blacklist;
      
    var isWhitelisted = false;
    var isBlacklisted = false;
    
    for (var i=0; i<aclWhitelist.length; ++i) {
      var aclRegex = convertWildcardToRegex(aclWhitelist[i]);
      if(origin.match(aclRegex)) {
        isWhitelisted = true;
        break;
      }
    }
     
    for (var j=0; i<aclBlacklist.length; ++j) {
      var aclRegex = convertWildcardToRegex(aclBlacklist[j]);
      if(origin.match(aclRegex)) {
        isBlacklisted = true;
        break;
      }
    }
    
    return isWhitelisted && !isBlacklisted;
  }
  
  // Calls a function with either positional or named parameters
  // In either case, additionalParams will be appended to the end
  function invokeProcedure(fn, self, params, additionalParams) {
    if (!(params instanceof Array)) {
      // get string representation of function
      var fnDef = fn.toString();
      
      // parse the string representation and retrieve order of parameters
      var argNames = fnDef.substring(fnDef.indexOf("(")+1, fnDef.indexOf(")"));
      argNames = (argNames === "") ? [] : argNames.split(", ");
      
      var argIndexes = {};
      for (var i=0; i<argNames.length; i++) {
        argIndexes[argNames[i]] = i;
      }
      
      // construct an array of arguments from a dictionary
      var callParameters = [];
      for (var paramName in params) {
        if (typeof argIndexes[paramName] !== "undefined") {
          callParameters[argIndexes[paramName]] = params[paramName];
        } else {
          throw "No such param!";
        }
      }
      
      params = callParameters;
    }
    
    // append additional parameters
    if (typeof additionalParams !== "undefined") {
      params = params.concat(additionalParams);
    }
    
    // invoke function with specified context and arguments array
    return fn.apply(self, params);
  }
  
  // JSON encode an object into pmrpc message
  function encode(obj) {
    return "pmrpc." + JSON.stringify(obj);
  }
  
  // JSON decode a pmrpc message
  function decode(str) {
    return JSON.parse(str.substring("pmrpc.".length));
  }

  // Creates a base JSON-RPC object, usable for both request and response.
  // As of JSON-RPC 2.0 it only contains one field "jsonrpc" with value "2.0"
  function createJSONRpcBaseObject() {
    var call = {};
    call.jsonrpc = "2.0";
    return call;
  }

  // Creates a JSON-RPC request object for the given method and parameters
  function createJSONRpcRequestObject(procedureName, parameters, id) {
    var call = createJSONRpcBaseObject();
    call.method = procedureName;
    call.params = parameters;
    if (typeof id !== "undefined") {
      call.id = id;
    }
    return call;
  }

  // Creates a JSON-RPC error object complete with message and error code
  function createJSONRpcErrorObject(errorcode, message, data) {
    var error = {};
    error.code = errorcode;
    error.message = message;
    error.data = data;
    return error;
  }

  // Creates a JSON-RPC response object.
  function createJSONRpcResponseObject(error, result, id) {
    var response = createJSONRpcBaseObject();
    response.id = id;
    
    // check to see if the error object is set
    if (typeof error === "undefined" || error === null) {
      // no errors, go with the payload
      response.result = (result === "undefined") ? null : result;
    } else {
      // error response
      response.error = error;
    }
    
    return response;
  }

  // dictionary of services registered for remote calls
  var registeredServices = {};
  // dictionary of requests being processed on the client side
  var callQueue = {};
  
  // register a service available for remote calls
  // if no acl is given, assume that it is available to everyone
  function register(config) {
    registeredServices[config.publicProcedureName] = {
      "publicProcedureName" : config.publicProcedureName,
      "procedure" : config.procedure,
      "context" : config.procedure.context,
      "isAsync" : typeof config.isAsynchronous !== "undefined" ?
                    config.isAsynchronous : false,
      "acl" : typeof config.acl !== "undefined" ? 
                config.acl : {whitelist: ["*"], blacklist: []}};
  }

  // unregister a previously registered procedure
  function unregister(publicProcedureName) {
    delete registeredServices[publicProcedureName];
  }

  // retreive service for a specific procedure name
  function fetchRegisteredService(publicProcedureName){
    return registeredServices[publicProcedureName];
  }
  
  // receive and execute a pmrpc call which may be a request or a response
  function processPmrpcMessage(serviceCallEvent, eventSource) {
    // if the message is not for pmrpc, ignore it.
    if (serviceCallEvent.data.indexOf("pmrpc.") !== 0) {
      return;
    } else {
      message = decode(serviceCallEvent.data);
      
      if (typeof message.method !== "undefined") {
        // this is a request
        var newServiceCallEvent = {
          data : serviceCallEvent.data,
          source : typeof eventSource !== "undefined" ? eventSource.source : serviceCallEvent.source,
          origin : typeof eventSource !== "undefined" ? eventSource.location : serviceCallEvent.origin
        };
        
        response = processJSONRpcRequest(message, newServiceCallEvent);
        // return the response
        if (response !== null) {
          if (message.method === "getDestinationOrigin") {
            sendPmrpcMessage(
              newServiceCallEvent.source, response, "*");
          } else {
            sendPmrpcMessage(
              newServiceCallEvent.source, response, newServiceCallEvent.origin);
          }
        }
      } else {
        // this is a response
        processJSONRpcResponse(message);
      }
    }
  }
  
  // Process a single JSON-RPC Request
  function processJSONRpcRequest(request, serviceCallEvent) {
    if (request.jsonrpc !== "2.0") {
      // Invalid JSON-RPC request    
      return createJSONRpcResponseObject(
        createJSONRpcErrorObject(-32600, "Invalid request.", 
          "The recived JSON is not a valid JSON-RPC 2.0 request."),
        null,
        null);
    }
    
    var id = request.id;
    var service = fetchRegisteredService(request.method);
    
    if (typeof service !== "undefined") {
      // check the acl rights
      if (checkACL(service.acl, serviceCallEvent.origin)) {
        try {
          if (service.isAsync) {
            // if the service is async, create a callback which the service
            // must call in order to send a response back
            var cb = function (returnValue) {
                       sendPmrpcMessage(
                         serviceCallEvent.source,
                         createJSONRpcResponseObject(null, returnValue, id),
                         serviceCallEvent.origin);
                     };
            invokeProcedure(
              service.procedure, service.context, request.params, [cb, serviceCallEvent]);
            return null;
          } else {
            // if the service is not async, just call it and return the value
            var returnValue = invokeProcedure(
                                service.procedure,
                                service.context, 
                                request.params, [serviceCallEvent]);
            return (typeof id === "undefined") ? null : 
              createJSONRpcResponseObject(null, returnValue, id);
          }
        } catch (error) {
          if (typeof id === "undefined") {
            // it was a notification nobody cares if it fails
            return null;
          }
          
          if (error === "No such param!") {
            return createJSONRpcResponseObject(
              createJSONRpcErrorObject(
                -32602, "Invalid params.", error.description),
              null,
              id);            
          }            
          
          // the -1 value is "application defined"
          return createJSONRpcResponseObject(
            createJSONRpcErrorObject(
              -1, "Application error.", error.description),
            null,
            id);
        }
      } else {
        // access denied
        return (typeof id === "undefined") ? null : createJSONRpcResponseObject(
          createJSONRpcErrorObject(
            -2, "Application error.", "Access denied on server."),
          null,
          id);
      }
    } else {
      // No such method
      return (typeof id === "undefined") ? null : createJSONRpcResponseObject(
        createJSONRpcErrorObject(
          -32601,
          "Method not found.", 
          "The requestd remote procedure does not exist or is not available."),
        null,
        id);
    }
  }
  
  // internal rpc service that receives responses for rpc calls 
  function processJSONRpcResponse(response) {
    var id = response.id;
    var callObj = callQueue[id];
    if (typeof callObj === "undefined" || callObj === null) {
      return;
    } else {
      delete callQueue[id];
    }
    
    // check if the call was sucessful or not
    if (typeof response.error === "undefined") {
      callObj.onSuccess( { 
        "destination" : callObj.destination,
        "publicProcedureName" : callObj.publicProcedureName,
        "params" : callObj.params,
        "status" : "success",
        "returnValue" : response.result} );
    } else {
      callObj.onError( { 
        "destination" : callObj.destination,
        "publicProcedureName" : callObj.publicProcedureName,
        "params" : callObj.params,
        "status" : "error",
        "description" : response.error.message + " " + response.error.data} );
    }
  }
  
  // call remote procedure, with configuration:
  //   destination - window on which the procedure is registered
  //   publicProcedureName - name under which the procedure is registered
  //   params - array of parameters fir the procedure call
  //   onSuccess - procedure to be called if the rpc call was successful
  //   onError - procedure to be called if the rpc call wasn't successful
  //   retries - number of retries pmrpc will attempt if previous calls do not
  //             create a response
  //   timeout - number of miliseconds pmrpc will wait for any kind of answer
  //             before givnig up or retrying
  //   acl - access control list for the receiver of the message
  function call(config) {
    // check that number of retries is not -1, that is a special internal value
    if (config.retries && config.retries < 0) {
      throw new Exception("number of retries must be 0 or higher");
    }
    
    var callObj = {
      destination : config.destination,
      publicProcedureName : config.publicProcedureName,
      onSuccess : typeof config.onSuccess !== "undefined" ? 
                    config.onSuccess : function (){},
      onError : typeof config.onError !== "undefined" ? 
                    config.onError : function (){},
      retries : typeof config.retries !== "undefined" ? config.retries : 5,
      timeout : typeof config.timeout !== "undefined" ? config.timeout : 500,
      destinationDomain : config.destinationDomain,
      status : "requestNotSent"
    };
    
    isNotification = typeof config.onError === "undefined" &&
                       typeof config.onSuccess === "undefined";
    params = (typeof config.params !== "undefined") ? config.params : [];
    callId = generateUUID();
    callQueue[callId] = callObj; 
    
    if (isNotification) {
      callObj.message = createJSONRpcRequestObject(
                  config.publicProcedureName, params);
    } else {
      callObj.message = createJSONRpcRequestObject(
                          config.publicProcedureName, params, callId);
    }
    
    waitAndSendRequest(callId);
  }
  
  // Use the postMessage API to send a pmrpc message to a destination
  function sendPmrpcMessage(destination, message, acl, cbx) {
    var cb = function(destinationOrigin) {
      if (typeof destination === "undefined" || destination === null) {
        self.postMessage(encode(message));
      } else if (typeof destination.frames !== "undefined") {
        if (typeof acl === "undefined") {
          acl = {whitelist: ["*"], blacklist: []};
        } else if (typeof acl === "string") {
          acl = {whitelist: [acl+"*"], blacklist: []};
        }
        if (checkACL(acl, destinationOrigin)) {
          return destination.postMessage(encode(message), destinationOrigin);
        } else {
          return "Pmrpc ACL error.";
        }
      } else {
        destination.postMessage(encode(message));
      }
    };
    
    if (acl === "*") {
      var result = cb("*");
      if (typeof cbx !== "undefined") {
        cbx(result);
      }
    } else {
      call({
        "destination" : destination,
        "publicProcedureName" : "getDestinationOrigin",
        "onSuccess" : function (callResult) {
                        result = cb(callResult.returnValue);
                        if (typeof cbx !== "undefined") {
                          cbx(result);
                        }
                      },
        "retries" : 0,
        "destinationDomain" : "*"});
      return "";
    }
  }
    
  // Execute a remote call by first pinging the destination and afterwards
  // sending the request
  function waitAndSendRequest(callId) {
    var callObj = callQueue[callId];
    if (typeof callObj === "undefined") {
      return;
    } else if (callObj.retries <= -1) {      
      processJSONRpcResponse(
        createJSONRpcResponseObject(
          createJSONRpcErrorObject(
          -4, "Application error.", "Destination unavailable."),
          null,
          callId));
    } else if (callObj.status === "requestSent") {
      return;
    } else if (callObj.retries === 0 || callObj.status === "available") {
      callObj.status = "requestSent";
      callObj.retries = -1;
      callQueue[callId] = callObj;
      
      var cbx = function(res) {
        if (res === "Pmrpc ACL error.") {
          processJSONRpcResponse(
            createJSONRpcResponseObject(
              createJSONRpcErrorObject(
                -3, 
                "Application error.",
                "Access denied on client."),
              null,
              callId));
        }
        
        self.setTimeout(function() { waitAndSendRequest(callId); }, callObj.timeout);
      }

      sendPmrpcMessage(
        callObj.destination, callObj.message, callObj.destinationDomain, cbx);

    } else {
      // if we can ping some more - send a new ping request
      callObj.status = "pinging";
      callObj.retries = callObj.retries - 1;
      
      call({
        "destination" : callObj.destination,
        "publicProcedureName" : "receivePingRequest",
        "onSuccess" : function (callResult) {
                        if (callResult.returnValue === true) {
                          callQueue[callId].status = "available";
                        }
                      },
        "params" : [callObj.publicProcedureName], 
        "retries" : 0,
        "destinationDomain" : callObj.destinationDomain});
      callQueue[callId] = callObj;
      self.setTimeout(function() { waitAndSendRequest(callId); }, callObj.timeout);
    }
  }
  
  // function that receives pings for methods and returns responses 
  function receivePingRequest(publicProcedureName) {
    return typeof fetchRegisteredService(publicProcedureName) !== "undefined";
  }
  
  // register method for receiving and returning pings
  register({
    "publicProcedureName" : "receivePingRequest",
    "procedure" : receivePingRequest});
    
  function getDestinationOrigin() {
    return this.location.href;
  }
  
  // register method for receiving and returning pings
  register({
    "publicProcedureName" : "getDestinationOrigin",
    "procedure" : getDestinationOrigin});
  
  // attach the pmrpc event listener 
  // todo: when attaching a listener, add a special paramter which tells
  // which object the listener is attached to using:
  //  function (worker) {
  //    return function(messageEvent) {
  //      processPmrpcMessage(messageEvent, worker);
  //    };
  //  }(newWorker);
  if ('window' in this || 'onmessage' in this) {
    // window object or dedicated worker
    if ("addEventListener" in this) {
      // FF
      this.addEventListener("message", processPmrpcMessage, false);
    } else {
      // IE
      this.attachEvent("onmessage", processPmrpcMessage);
    }
  } else if ('onconnect' in this) {
    // shared worker 
    // set onconnect function with addeventlistener also
    onconnect = function (e) {
    
      var listener = function (port) { // todo: switch to addeventlistener
        port.source = port;  // todo: check if this is allowed - we are changing the message event
        port.workerType = "shared";
        
        return function(messageEvent) {
          processPmrpcMessage(messageEvent, port);
        };
      }(e.ports[0]);
    
      if ("addEventListener" in e.ports[0]) {
        // FF
        e.ports[0].addEventListener("message", processPmrpcMessage, false);
      } else {
        // IE
        e.ports[0].attachEvent("onmessage", processPmrpcMessage);
      }
    };
  } else {
    throw "Error!";
  }
  
  var createDedicatedWorker = this.Worker;
  this.nonPmrpcWorker = createDedicatedWorker;
  var createSharedWorker = this.SharedWorker;
  this.nonPmrpcSharedWorker = createSharedWorker;
  
  this.Worker = function(scriptUri) {
    var newWorker = new createDedicatedWorker(scriptUri);
    newWorker.source = newWorker;
    newWorker.location = scriptUri; // todo: make this handle relative urls
    newWorker.workerType = "dedicated";
    
    newWorker.onmessage = function (worker) { // todo: switch to addeventlistener
      return function(messageEvent) {
        processPmrpcMessage(messageEvent, worker);
      };
    }(newWorker);
    
    return newWorker;
  };
  
  this.SharedWorker = function(scriptUri, workerName) {
    var newWorker = new createSharedWorker(scriptUri, workerName);
    newWorker.source = newWorker.port;
    newWorker.location = scriptUri; // todo: make this handle relative urls
    newWorker.workerType = "shared";
    
    newWorker.port.onmessage = function (worker) { // todo: switch to addeventlistener
      return function(messageEvent) {
        processPmrpcMessage(messageEvent, worker);
      };
    }(newWorker);
    
    return newWorker;
  };
  
  // return public methods
  return {
    register : register,
    unregister : unregister,
    call : call
  };
}();