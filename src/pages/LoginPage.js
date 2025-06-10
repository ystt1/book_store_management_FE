// src/pages/LoginPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Statistic } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// <<< IMPORT ĐÚNG >>>
import { MediaPlayer, Debug } from 'dashjs';
import styles from './LoginPage.module.css';

// <<< CẤU HÌNH ĐÚNG >>>
const DASH_CONFIG = {
     streaming: {
        delay: {
            liveDelayFragmentCount: 3,
            liveDelay: 2,
            useSuggestedPresentationDelay: true
        },
        abr: {
            useDefaultABRRules: false,
            ABRStrategy: 'abrLoLP',
            bandwidthSafetyFactor: 0.95,
            useBufferOccupancyABR: true,
            additionalAbrRules: {
                insufficientBufferRule: { enabled: true, bufferTimeToStartIncrease: 0.3, bufferTimeToEndIncrease: 1.5 },
                switchHistoryRule: { enabled: true, sampleSize: 3, switchTimeout: 800 },
                droppedFramesRule: { enabled: true, maxDroppedFrameRate: 0.05 }
            },
            throughput: { averageCalculationMode: 'ewma', slidingWindowSize: 5, estimationThreshold: 0.05 },
            switchUpRatioSafetyFactor: 1.05,
            switchDownRatioSafetyFactor: 0.95,
            maxSwitchLoadingTime: 300,
            minBitrate: 200000,
            maxBitrate: 8000000,
            initialBufferLevel: 0.3,
            bufferTimeAtTopQuality: 1.5,
            bufferToKeep: 0.8
        },
        buffer: {
            bufferTimeAtTopQuality: 1.5,
            bufferTimeAtTopQualityLongForm: 1.5,
            initialBufferLevel: 0.3,
            stableBufferTime: 1.2,
            fastSwitchEnabled: true,
            abandonLoadTimeout: 3000,
            bufferPruningInterval: 1.5,
            bufferToKeep: 0.8,
            bufferTimeDefault: 1.5
        },
        liveCatchup: {
            enabled: true,
            maxDrift: 0.5,
            playbackRate: { min: 0.95, max: 1.05 },
            minDrift: 0.03,
            playbackBufferMin: 0.3
        },
        lowLatencyEnabled: true,
        liveDelay: 2,
        liveCatchUpMinDrift: 0.03,
        liveCatchUpPlaybackRate: 0.5
    },
    debug: {
        logLevel: Debug.LOG_LEVEL_INFO
    }
};

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const dashPlayerRef = useRef(null);
    const intervalRef = useRef(null);
    const [metrics, setMetrics] = useState({
        bandwidth: 0, buffered: 0, currentLatency: 0, currentQuality: 'N/A',
        targetLatency: DASH_CONFIG.streaming.liveDelay || 2, totalDroppedFrames: 0,
        currentBitrate: 0, availableQualities: 0, playbackRate: 1, catchupGap: 0,
        downloadTime: 0, bufferOccupancy: 0,
        optimizationStatus: 'Đang tối ưu hóa...'
    });

    useEffect(() => {
        message.info('Đã bật chế độ tối ưu hóa hiệu suất phát video với các cải tiến:');
        message.info('1. Giảm độ trễ phát sóng');
        message.info('2. Tối ưu hóa chuyển đổi chất lượng');
        message.info('3. Cải thiện xử lý buffer');
        message.info('4. Tăng độ ổn định phát sóng');

        const manifestUrl = 'https://akamaibroadcasteruseast.akamaized.net/cmaf/live/657078/akasource/out.mpd';
        // const manifestUrl = 'https://livesim.dashif.org/livesim-chunked/chunkdur_1/ato_7/testpic4_8s/Manifest.mpd'; // URL LL-DASH test khác

        let player = null; // Định nghĩa player ở đây

        const initPlayer = () => {
            const video = videoRef.current;
            if (!video) return;

             console.log("Initializing player...");
            // <<< KHỞI TẠO ĐÚNG >>>
            player = MediaPlayer().create();
            dashPlayerRef.current = player;
            
            player.updateSettings(DASH_CONFIG);
             // Thêm log để kiểm tra
            console.log("Player instance:", player);
            console.log("Has getBitrateInfoListFor:", typeof player.getBitrateInfoListFor);
            console.log("Has getMetricsFor:", typeof player.getMetricsFor);

            // <<< GỌI HÀM TRỰC TIẾP TỪ PLAYER >>>
             player.on(MediaPlayer.events.PLAYBACK_METADATA_LOADED, () => {
                 console.log("Metadata Loaded. Getting initial qualities.");
                 // KIỂM TRA VÀ GỌI TRỰC TIẾP
                 if(typeof player.getBitrateInfoListFor === 'function') {
                    const qualities = player.getBitrateInfoListFor('video');
                    if (qualities) {
                         console.log("Available qualities:", qualities);
                        setMetrics(prev => ({ ...prev, availableQualities: qualities.length }));
                    }
                 }
             });

            player.on(MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
                if (e.mediaType === 'video') {
                    // <<< SỬA LỖI: GỌI TRỰC TIẾP TỪ PLAYER, KHÔNG DÙNG getDashAdapter >>>
                    if(typeof player.getBitrateInfoListFor === 'function') {
                         const qualities = player.getBitrateInfoListFor('video');
                         const currentQualityInfo = qualities ? qualities[e.newQuality] : null;
                         if (currentQualityInfo) {
                             //message.info(`Chất lượng: ${currentQualityInfo.height}p (${Math.round(currentQualityInfo.bitrate / 1000)} Kbps)`);
                             setMetrics(prev => ({
                                 ...prev,
                                 currentQuality: `${currentQualityInfo.height}p`,
                                 currentBitrate: Math.round(currentQualityInfo.bitrate / 1000)
                             }));
                         }
                    }
                }
            });
           
            player.on(MediaPlayer.events.ERROR, (e) => {
                console.error('DASH error:', e);
                 message.error('Lỗi phát video: ' + (e.error?.message || JSON.stringify(e.error) || 'Unknown'));
            });

            player.on(MediaPlayer.events.PLAYBACK_RATE_CHANGED, (e) => {
                setMetrics(prev => ({ ...prev, playbackRate: e.playbackRate }));
            });

             // Dọn dẹp interval cũ nếu có
            if(intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                 // <<< SỬA LỖI: THAY THẾ getDashMetrics() bằng getMetricsFor() VÀ GỌI TRỰC TIẾP >>>
                 if (player && player.isReady() && typeof player.getMetricsFor === 'function') {
                    const settings = player.getSettings();
                    const videoMetrics = player.getMetricsFor('video'); // <<< API MỚI
                    
                    if (videoMetrics && settings) {
                        const bandwidth = player.getAverageThroughput('video'); // <<< TRỰC TIẾP
                        const latency = player.getCurrentLiveLatency(); // <<< TRỰC TIẾP
                        const droppedFramesObj = videoMetrics.DroppedFrames; // <<< TRUY CẬP MỚI
                        // Lấy request HTTP gần nhất từ danh sách
                        const httpRequest = (videoMetrics.HttpList && videoMetrics.HttpList.length > 0) 
                                             ? videoMetrics.HttpList[videoMetrics.HttpList.length - 1] 
                                             : null;
                        
                        const bufferLevel = player.getBufferLength('video'); // <<< TRỰC TIẾP
                        const targetLatency = settings.streaming.liveDelay;
                         // Kiểm tra trequest và tresponse trước khi gọi getTime()
                        const downloadTime = (httpRequest && httpRequest.trequest && httpRequest.tresponse) 
                                            ? (httpRequest.tresponse.getTime() - httpRequest.trequest.getTime()) 
                                            : 0;
                        const bufferOccupancy = bufferLevel && settings.streaming.buffer.bufferTimeDefault ? (bufferLevel / settings.streaming.buffer.bufferTimeDefault) * 100 : 0;
                        const catchupGap = latency - targetLatency;

                        setMetrics(prev => ({
                            ...prev,
                            bandwidth: isNaN(bandwidth) ? 0 : Math.round(bandwidth),
                            buffered: bufferLevel || 0,
                            currentLatency: latency || 0,
                            targetLatency: targetLatency || DASH_CONFIG.streaming.liveDelay,
                            totalDroppedFrames: droppedFramesObj ? droppedFramesObj.droppedFrames : 0, // <<< TRUY CẬP MỚI
                            downloadTime,
                            bufferOccupancy: Math.round(bufferOccupancy),
                            catchupGap: catchupGap > 0 ? Math.round(catchupGap * 1000) : 0
                        }));
                    }
                 }
             }, 2000); // Giảm tần suất update xuống 2s


            // autoPlay=true
            player.initialize(video, manifestUrl, true);
            // player.play(); // initialize với true thì không cần play()

        };

        initPlayer();

        // <<< DỌN DẸP ĐẦY ĐỦ >>>
        return () => {
             console.log("Cleanup: Destroying player and clearing interval");
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                 intervalRef.current = null;
            }
            if (player) {
                 player.destroy();
                 dashPlayerRef.current = null;
            }
        };
    }, []); // Dependency array rỗng


    const onFinish = async (values) => {
        //... (giữ nguyên)
         setLoading(true);
        try {
            const result = await login(values.username, values.password);
            if (result.success) {
                message.success('Đăng nhập thành công!');
                const { user } = result;
                const redirectPath = user.role === 'admin' ? '/admin/dashboard' : `/store/${user.storeId}/dashboard`;
                navigate(redirectPath, { replace: true });
            } else {
                message.error(result.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error("Login Error:", error);
            message.error('Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setLoading(false);
        }
    };
    
    // Thêm check, nếu videoRef.current không có thì không render video
     const videoElement = videoRef.current ? (
       <video ref={videoRef} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }} />
     ) :  <video ref={videoRef} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }} />;


    return (
        <div className={styles.loginContainer}>
            <div className={styles.videoContainer}>
               {videoElement}
            </div>
            <div className={styles.loginCardOverlay}>
                <Card className={styles.loginCard}>
                    <h1 className={styles.loginTitle}>Đăng Nhập</h1>
                    <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
                         <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}><Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large"/></Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}><Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large"/></Form.Item>
                        <Form.Item><Button type="primary" htmlType="submit" loading={loading} className={styles.loginButton} size="large" block>Đăng Nhập</Button></Form.Item>
                    </Form>
                    <div className={styles.metricsContainer}>
                        <Row gutter={[8, 8]}>
                            <Col span={12}><Statistic title="Độ trễ / Mục tiêu (s)" value={`${metrics.currentLatency.toFixed(2)} / ${metrics.targetLatency.toFixed(2)}`} /></Col>
                             <Col span={12}><Statistic title="Buffer (s) / %" value={`${metrics.buffered.toFixed(2)} / ${metrics.bufferOccupancy}%`} /></Col>
                            <Col span={12}><Statistic title="Băng thông (Kbps)" value={metrics.bandwidth} /></Col>
                            <Col span={12}><Statistic title="Bitrate (Kbps)" value={metrics.currentBitrate}/></Col>
                             <Col span={12}><Statistic title="Chất lượng / Tổng" value={`${metrics.currentQuality} / ${metrics.availableQualities}`} /></Col>
                            <Col span={12}><Statistic title="Tốc độ / Lệch (ms)" value={`${metrics.playbackRate.toFixed(2)}x / ${metrics.catchupGap}`} /></Col>
                            <Col span={12}><Statistic title="Frame mất" value={metrics.totalDroppedFrames} /></Col>
                            <Col span={12}><Statistic title="T.gian tải (ms)" value={metrics.downloadTime} /></Col>
                        </Row>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;