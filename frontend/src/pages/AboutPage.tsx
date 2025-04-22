import React from 'react';
import AboutDialog from '~/app/AboutDialog';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate(-1);
  return <AboutDialog onClose={handleClose} />;
};

export default AboutPage;
