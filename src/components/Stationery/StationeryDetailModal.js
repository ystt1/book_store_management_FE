import React from 'react';
import { Modal, Descriptions, Image, Typography } from 'antd';
import moment from 'moment';
import styles from './StationeryDetailModal.module.css';

const { Title } = Typography;

const StationeryDetailModal = ({ isOpen, onClose, stationeryData }) => {
    return (
        <Modal
            title={<Title level={4}>Chi tiết văn phòng phẩm</Title>}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className={styles.detailContainer}>
                <div className={styles.imageSection}>
                    {stationeryData?.image ? (
                        <Image
                            src={`${process.env.REACT_APP_API_URL}${stationeryData.image.url}`}
                            alt={stationeryData.name}
                            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                    ) : (
                        <div className={styles.noImage}>Không có hình ảnh</div>
                    )}
                </div>

                <Descriptions bordered column={1} className={styles.descriptions}>
                    <Descriptions.Item label="Tên sản phẩm">
                        {stationeryData?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {stationeryData?.description || 'Không có mô tả'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá">
                        {stationeryData?.price?.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }) || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng tồn kho">
                        {stationeryData?.stock || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp">
                        {stationeryData?.supplier?.name || 'Không có'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {stationeryData?.createdAt ? 
                            moment(stationeryData.createdAt).format('DD/MM/YYYY HH:mm:ss') : 
                            'N/A'
                        }
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                        {stationeryData?.updatedAt ? 
                            moment(stationeryData.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 
                            'N/A'
                        }
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
};

export default StationeryDetailModal; 