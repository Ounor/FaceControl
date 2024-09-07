import React from "react";
import {
    Button,
    Modal
} from 'antd';

interface ModalProps {
    isModalOpenLeaders: boolean;
    handleCancel: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const LeadersModal: React.FC<ModalProps> = ({isModalOpenLeaders, handleCancel}) => {
    return <>
        <Modal 
            title="Таблица игроков" open={isModalOpenLeaders} 
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                Ок
                </Button>
            ]}
        >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </Modal>
    </>
};
export default LeadersModal;