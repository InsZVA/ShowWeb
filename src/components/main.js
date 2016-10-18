/**
 * Created by InsZVA on 2016/10/17.
 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardMedia, CardText, CardTitle} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import Paper from 'material-ui/Paper';

const Main = React.createClass({
    getInitialState: function() {
        return {
            state: 'ready',
            online_num: 0,
            role: 'none',
            remote_video_src: '',
            local_video_src: ''
        }
    },
    ws: {},
    pc: {},
    PeerConnection: {},
    getUserMedia: {},
    componentDidMount: function() {
        var pthis = this;
        this.ws = new WebSocket("wss://localhost/serv");
        this.ws.onmessage = function(event) {
            var msg = JSON.parse(event.data);
            switch (msg.msg) {
                case 'error':
                    alert("错误信息：" + msg.error + "\n您可以刷新页面。");
                    break;
                case 'ok':
                    break;
                case 'update':
                    pthis.setState({online_num: msg.online_num});
                    break;
                case 'paired':
                    pthis.setState({state: 'paired', role: msg.role});
                    pthis.getUserMedia = (navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia);
                    pthis.PeerConnection = (window.PeerConnection ||
                        window.webkitPeerConnection00 ||
                        window.webkitRTCPeerConnection ||
                        window.mozRTCPeerConnection);
                    pthis.pc = new pthis.PeerConnection({"iceServers": []});
                    pthis.pc.onicecandidate = function(event){
                        pthis.ws.send(JSON.stringify({
                            "msg": "candidate",
                            "candidate": event.candidate
                        }));
                    };
                    pthis.pc.onaddstream = function(event){
                        pthis.setState({remote_video_src: URL.createObjectURL(event.stream)});
                    };
                    if (pthis.state.role == 'offer') {
                        pthis.getUserMedia.call(navigator, {
                            "audio": true,
                            "video": true
                        }, function(stream){
                            pthis.setState({local_video_src: URL.createObjectURL(stream)});
                            pthis.pc.addStream(stream);
                                pthis.pc.createOffer().then(function(offer) {
                                    return pthis.pc.setLocalDescription(offer);
                                }).then(function() {
                                    pthis.ws.send(JSON.stringify({
                                        "msg": "offer",
                                        "sdp": pthis.pc.localDescription
                                    }));
                                });
                        }, function(error){
                            //处理媒体流创建失败错误
                        });
                    }
                    break;
                case 'offer':
                    if (pthis.state.role == 'answer') {
                        pthis.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                        pthis.getUserMedia.call(navigator, {
                            "audio": true,
                            "video": true
                        }, function(stream){
                            pthis.setState({local_video_src: URL.createObjectURL(stream)});
                            pthis.pc.addStream(stream);
                            pthis.pc.createAnswer().then(function(answer) {
                                return pthis.pc.setLocalDescription(answer);
                            }).then(function() {
                                pthis.ws.send(JSON.stringify({
                                    "msg": "answer",
                                    "sdp": pthis.pc.localDescription
                                }));
                            });
                        }, function(error){
                            //处理媒体流创建失败错误
                        });
                    }
                    break;
                case 'answer':
                    pthis.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                    break;
                case 'candidate':
                    pthis.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                    break;
            }
        };
        this.ws.onopen = function() {
            this.send(JSON.stringify(
                {msg: 'connect'}
            ))
        }
    },
    startpair: function() {
        this.ws.send(JSON.stringify({
            msg: 'pair'
        }));
        this.setState({state: 'pairing'});
    },
    stoppair: function() {
        this.ws.send(JSON.stringify({
            msg: 'stop_pair'
        }));
        this.setState({state: 'ready'});
    },
    render: function() {
        if (this.state.state == 'pairing' || this.state.state == 'ready')
            return <div>
                <AppBar
                    title="激情聊天"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <Card>
                    <CardHeader
                        title="美女姐姐"
                        subtitle="邀请你来视频聊天"
                        avatar="https://timgsa.baidu.com/timg?image&quality=80&size=b10000_10000&sec=1476731465570&di=c3123864665dffac54afe2dd84523564&imgtype=jpg&src=http%3A%2F%2Fwww.qqtu8.net%2Ff%2F20120909204749.jpg"
                    />
                    <CardMedia
                        overlay={<CardTitle title="激情聊天室" subtitle="免费随机配对聊天"/>}
                    >
                        <img src="http://i0.sinaimg.cn/gm/2014/0801/U7233P115DT20140801133337.jpg"/>
                    </CardMedia>
                    <CardText>
                        当前在线人数：{this.state.online_num} <br/>
                        {this.state.state == "pairing" ? <LinearProgress mode="indeterminate"/> : "预计匹配时间： 1分钟" }
                        {this.state.state == "pairing" ? "正在匹配。。。" : "" }

                        </CardText>
                    <CardActions>
                        {this.state.state != "pairing" ? <FlatButton label="开始配对" onClick={this.startpair}/> : <FlatButton label="停止配对" onClick={this.stoppair} /> }
                        <FlatButton label="深入联系"/>
                    </CardActions>
                </Card>
            </div>;
        else if (this.state.state == 'paired')
            return <div>
                <AppBar
                    title="激情聊天"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <Paper>
                    <video ref="remoteVideo" autoPlay="autoPlay" src={this.state.remote_video_src} />
                    <video ref="localVideo" autoPlay="autoPlay" src={this.state.local_video_src} />
                </Paper>
            </div>
    }

});

export default Main;