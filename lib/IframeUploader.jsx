'use strict';

var React = require('react');

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

  getInitialState: function() {
    return {
      uid: 1
    };
  },

  componentDidMount: function() {
    var el = React.findDOMNode(this);
  },

  _getName: function() {
    return 'iframe_uploader_' + this.state.uid;
  },

  _onload: function(e) {
    // ie8里面render方法会执行onLoad，应该是bug
    if (!this.startUpload) {
      return;
    }

    var iframe = e.target;
    var props = this.props;
    try {
      var response = JSON.parse(iframe.contentDocument.body.innerText);

      if( ! response.response.success) {
        props.onError(response);
      } else {
        props.onSuccess(response);
      }
    } catch (err) {
      response = 'cross-domain';
      props.onError(err);
    }

    this.startUpload = false;
    this.setState({
      uid: this.state.uid + 1
    });
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

    React.findDOMNode(this.refs['form']).submit();
  },

  _triggerFilInput: function() {
    this.refs['file'].getDOMNode().click();
  },

  render: function() {
    var iframeName = this._getName();
    var iframe = this._getIframe();

    return (
      <span style={boxStyle} onClick={this._triggerFilInput}>
        <form action={this.props.action}
          target={iframeName}
          encType="multipart/form-data"
          ref="form"
          method="post" style={formStyle}>

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
