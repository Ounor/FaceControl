import React from "react";
import {
    Button,
    Modal
} from 'antd';

interface ModalProps {
    isModalOpenLogin: boolean;
    handleCancel: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const LoginModal: React.FC<ModalProps> = ({isModalOpenLogin, handleCancel}) => {
    return <>
        <Modal 
            title="Войти" open={isModalOpenLogin}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                Войти
                </Button>,
                <Button key="back" onClick={handleCancel}>
                Отмена
                </Button>
            ]}
        >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </Modal>
    </>
};
export default LoginModal;