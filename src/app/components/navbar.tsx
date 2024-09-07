import {
    Button,
    Space,
} from 'antd';
import React, {useState} from 'react';
import RulesModal from './modals/rulesModal';
import LeadersModal from './modals/leadersModal';
import LoginModal from './modals/loginModal';

const Navbar: React.FC = () => {

    const [isModalOpenRules, setIsModalOpenRules] = useState<boolean>(false);
    const [isModalOpenLeaders, setIsModalOpenLeaders] = useState<boolean>(false);
    const [isModalOpenLogin, setIsModalOpenLogin] = useState<boolean>(false);

    const showModal = (modalCallback: (isSet: boolean) => void) => {
        modalCallback(true);
    };
  
    const handleCancel = (modalCallback: (isSet: boolean) => void) => {
        modalCallback(false);
    };
    
    return <>
        <Space>
            <Button onClick={() => showModal(setIsModalOpenRules)}>Правила игры</Button>
            <Button onClick={() => showModal(setIsModalOpenLeaders)}>Таблица игроков</Button>
            <Button onClick={() => showModal(setIsModalOpenLogin)}>Войти</Button>
        </Space>

        <RulesModal isModalOpenRules={isModalOpenRules} handleCancel={() => handleCancel(setIsModalOpenRules)}/>

        <LeadersModal isModalOpenLeaders={isModalOpenLeaders} handleCancel={() => handleCancel(setIsModalOpenLeaders)}/>

        <LoginModal 
            isModalOpenLogin={isModalOpenLogin}
            handleCancel={() => handleCancel(setIsModalOpenLogin)}
        />
    </>
};
export default Navbar;
