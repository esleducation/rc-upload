'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var request = require('../../../assets-src/js/helpers/request')


var AjaxUploader = React.createClass({

  _onChange: function(e) {
    var files = e.target.files;
    this._uploadFiles(files);
  },

  _onClick: function() {
    var el = ReactDOM.findDOMNode(this.refs.file);
    if (!el) {
      return;
    }
    el.click();
    el.value = '';
  },

  _uploadFiles: function(files) {
    var len = files.length;
    if (len > 0) {
      for (var i = 0; i < len; i++) {
        var file = files.item(i);
        this._post(file);
      }
    }
  },

  _post: function(file) {

    var props = this.props;

    props.onStart(file);

    // File object
    var files = {};
    files[props.name] = file;

    var req = request.api(props.action, {
      files : files,
      method : 'POST'
    }).then(function(response){
      props.onSuccess(response.response, file);
    }, function(error){
      props.onError(error, file)
    });
  },

  _onFileDrop(e) {
    if (e.type === 'dragover') {
      return e.preventDefault();
    }

    var files = e.dataTransfer.files;
    this._uploadFiles(files);

    e.preventDefault();
  },

  render() {
    var hidden = {display: 'none'};
    var props = this.props;
    return (
      <span onClick={this._onClick} onDrop={this._onFileDrop} onDragOver={this._onFileDrop}>
        <input type="file"
        ref="file" style={hidden}
        accept={props.accept} onChange={this._onChange}/>
        {props.children}
      </span>
    );
  }
});

module.exports = AjaxUploader;
