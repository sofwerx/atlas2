/*jshint esversion: 6 */

var React = require('react');
var _ = require('underscore');
var Constants = require('./../../../../constants');
import Actions from '../../../../actions';
import {getStyleForType} from './component-styles';
import {Button, Glyphicon} from 'react-bootstrap';
import {endpointOptions} from './component-styles';
import {actionEndpointOptions} from './component-styles';
import CanvasActions from './canvas-actions';
import CanvasStore from './canvas-store';
var LinkContainer = require('react-router-bootstrap').LinkContainer;

//one day - make it proper require, but JsPlumb 2.2.0 must be released
/*jshint -W117 */
require('jsplumb');
var jsPlumb = window.jsPlumb;
/*jshint -W117 */

var activeStyle = {
  boxShadow: "0 0 10px #00789b",
  color: "#00789b"
};

var Comment = React.createClass({
  getInitialState : function(){
    return {focused:false};
  },
  onClickHandler : function(event){
    event.preventDefault();
    event.stopPropagation();

    if (this.state.hover === "remove") {
      var id = this.props.id;
      var mapID = this.props.mapID;
      var workspaceID = this.props.workspaceID;
      Actions.deleteComment(workspaceID, mapID, id);
      return;
    }
    if (this.state.hover === "pencil") {
      var id = this.props.id; //jshint ignore:line
      var mapID = this.props.mapID; //jshint ignore:line
      var workspaceID = this.props.workspaceID;
      Actions.openEditGenericCommentDialog(workspaceID, mapID, id, this.props.comment.text);
      return;
    }
    if (this.state.hover === "group") {
      var mapID = this.props.mapID; //jshint ignore:line
      Actions.openCreateSubmapDialog({
        mapID:mapID,
        nodes:CanvasStore.getCanvasState().currentlySelectedNodes,
        comments: CanvasStore.getCanvasState().currentlySelectedComments});
    }

    if((event.nativeEvent.ctrlKey || event.nativeEvent.altKey)){
      if (this.props.focused) {
        CanvasActions.focusRemoveComment(this.props.id);
      } else {
        CanvasActions.focusAddComment(this.props.id);
      }
    } else if (this.props.focused) {
      CanvasActions.deselectNodesAndConnections();
    } else {
      CanvasActions.focusComment(this.props.id);
    }
  },
  mouseOver: function(target) {
    if(this.props.focused){
      this.setState({hover: target});
    }
  },
  mouseOut: function(target) {
    this.setState({hover: null});
  },
  renderMenu : function(focused){
      if (this.input) {
        jsPlumb.setDraggable(this.input, false);
      }
      if (!focused) {
        return null;
      }
      if(this.props.multi){
        var groupStyle = {
          position: "absolute",
          fontSize: "20px",
          color: "silver",
          top: "-25px",
          left: "0px",
          zIndex: "30"
        };
        if (this.state.hover === "group") {
          groupStyle = _.extend(groupStyle, activeStyle);
        }
        return(<div><Glyphicon onMouseOver={this.mouseOver.bind(this, "group")} onMouseOut={this.mouseOut} glyph="resize-small" style={groupStyle}></Glyphicon></div>);
      }
      var pencilStyle = {
        position: "absolute",
        fontSize: "20px",
        color: "silver",
        top: "-25px",
        left: "0px",
        zIndex: "30"
      };
      if (this.state.hover === "pencil") {
        pencilStyle = _.extend(pencilStyle, activeStyle);
        if (this.input) {
          jsPlumb.setDraggable(this.input, false);
        }
      }
      var removeStyle = {
        position: "absolute",
        color: "silver",
        top: "-25px",
        fontSize: "20px",
        left: "25px",
        zIndex: "30"
      };
      if (this.state.hover === "remove") {
        if (this.input) {
          jsPlumb.setDraggable(this.input, false);
        }
        removeStyle = _.extend(removeStyle, activeStyle);
      }
      var moveStyle = {
        position: "absolute",
        top: "-25px",
        color: "silver",
        left: "-25px",
        fontSize: "20px",
        zIndex: "30"
      };
      if (this.state.hover === "move") {
        moveStyle = _.extend(moveStyle, activeStyle);
        if (this.input) {
          jsPlumb.setDraggable(this.input, true);
        }
      }
      var menuItems = [];
      menuItems.push(<Glyphicon onMouseOver={this.mouseOver.bind(this, "move")} onMouseOut={this.mouseOut} glyph="move" style={moveStyle}></Glyphicon>);
      menuItems.push(<Glyphicon onMouseOver={this.mouseOver.bind(this, "pencil")} onMouseOut={this.mouseOut} glyph="pencil" style={pencilStyle}></Glyphicon>);
      menuItems.push(<Glyphicon onMouseOver={this.mouseOver.bind(this, "remove")} onMouseOut={this.mouseOut} glyph="remove" style={removeStyle}></Glyphicon>);
      return (
        <div>
          {menuItems}
        </div>
      );
    },
  render: function() {
    var comment = this.props.comment;

    var style = getStyleForType("GenericComment");

    var left = comment.x * this.props.size.width;
    var top = comment.y * this.props.size.height;
    style = _.extend(style, {
      left: left,
      top: top,
      position: 'absolute',
      cursor: 'pointer'
    });
    var _this = this;
    var id = this.props.id;
    var mapID = this.props.mapID;
    var txt = comment.text;
    var focused = this.props.focused;
    var workspaceID = this.props.workspaceID;
    var menu = this.renderMenu(focused);

    return (
      <div style={style} onClick={this.onClickHandler} id={id} ref={input => {
        if (input) {
          this.input = input;
        }
        if (!input) {
          return;
        }
        jsPlumb.draggable(input, {
          containment: true,
          grid: [
            50, 50
          ],
          stop: function(event) {
            var x = event.e.pageX;
            var y = event.e.pageY;
            Actions.updateComment(workspaceID, mapID, id, {pos:[x,y]});
          }
        });
      }}> {txt} {menu}
      </div>
    );
  }
});

module.exports = Comment;