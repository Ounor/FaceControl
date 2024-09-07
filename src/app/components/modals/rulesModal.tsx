import React from "react";
import {
    Button,
    Modal
} from 'antd';

interface ModalProps {
    isModalOpenRules: boolean;
    handleCancel: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RulesModal: React.FC<ModalProps> = ({isModalOpenRules, handleCancel}) => {
    return <>
        <Modal 
            title="Правила игры" open={isModalOpenRules} 
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
export default RulesModal;