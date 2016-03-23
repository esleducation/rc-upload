'use strict';

var React = require('react');
var misc = require('../../../assets-src/js/helpers/misc');
var AppStore = require('../../../assets-src/js/stores/AppStore');
var Notifier = require('notifier');

var formStyle = {
  position: 'absolute',
  overflow: 'hidden',
  top: 0
};
var boxStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};
var inputStyle = {
  position: 'absolute',
  filter: 'alpha(opacity=0)',
  opacity: 0.01,
  outline: 0,
  left: '-1000px',
  top: '-1000px',
  fontSize: 12
};

var IframeUploader = React.createClass({

  componentDidMount: function() {
    var el = React.findDOMNode(this);
  },

  _getName: function() {
    return 'iframe_uploader'
  },

  _onload: function(e) {
    // ie8里面render方法会执行onLoad，应该是bug
    if (!this.startUpload) {
      return;
    }

    var iframe = e.target;
    var props = this.props;
    var response;
    try {
    console.log('DEBUG rc-upload, IframeUploader');
      response = JSON.parse(iframe.contentDocument.body.innerText).response;

      // Set CSRF
      AppStore.setCSRF(response.csrf);

      if( ! response.success) {
        if(response.error && response.error.message && response.error.message.length) {
          for (var i = response.error.message.length - 1; i >= 0; i--) {
            Notifier.send({
              type : Notifier.type.ERROR,
              text : response.error.message[i]
            });
          }
        }
        props.onError(response.error);
      } else {
        props.onSuccess(response);
      }
    } catch (err) {
      response = 'cross-domain';
      props.onError(err);
    }

    this.startUpload = false;
  },

  _getIframe: function() {
    var name = this._getName();
    var hidden = {display: 'none'};
    return (
      <iframe
        key={name}
        onLoad={this._onload}
        style={hidden}
        name={name}>
      </iframe>
    );
  },

  _onChange: function(e) {
    this.startUpload = true;
    this.file = (e.target.files && e.target.files[0]) || e.target;
    this.props.onStart(this.file);
    React.findDOMNode(this.refs['form']).submit();
  },

  _triggerFillInput: function() {
    this.refs['file'].getDOMNode().click();
  },

  render: function() {
    var iframeName = this._getName();
    var iframe = this._getIframe();

    return (
      <span style={boxStyle} onClick={this._triggerFillInput}>
        <form action={misc.url.api(this.props.action)}
          target={iframeName}
          encType="multipart/form-data"
          ref="form"
          method="post" style={formStyle}>

          <input type="hidden" name="csrf" value={AppStore.getCSRF()} />

          <input type="file" ref="file"
            name={this.props.name}
            style={inputStyle}
            accept={this.props.accept}
            onChange={this._onChange}
          />

          {
            Object.keys(this.props.data).map(function(name, index){
              return (
                <input key={index} type="hidden" name={name} value={this.props.data[name]} />
              );
            }.bind(this))
          }
        </form>
        {iframe}
        {this.props.children}
      </span>
    );
  }
});

module.exports = IframeUploader;
