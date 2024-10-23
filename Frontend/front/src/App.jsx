import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Routes, Route } from 'react-router-dom';

import HomePage from '@/pages/HomePage';
import TripPage from '@/pages/TripPage';
import TripCreatePage from '@/pages/TripCreatePage';
import TripDetailPage from '@/pages/TripDetailPage';
import TripFinishPage from '@/pages/TripFinishPage';
import GalleryPage from '@/pages/GalleryPage';
import ErrorModal from '@/components/ErrorModal';
import LoadingPage from '@/pages/LoadingPage';
import KakaoCallbackPage from '@/pages/KakaoCallbackPage';
import NotfoundPage from '@/pages/NotfoundPage';
import InvitePage from '@/pages/InvitePage';

function App() {
  return (
    <div id='app'>
      <ErrorModal />
      <Routes>
        <Route path="" element={<HomePage />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/trip/create" element={<TripCreatePage />} />
        <Route path="/trip/:tripId" element={<TripDetailPage />} />
        <Route path="/finish/:tripId" element={<TripFinishPage />} />
        <Route path="/gallery/:tripId" element={<GalleryPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/invite/:tripId" element={<InvitePage />}></Route>
        <Route path="/kakao_callback" element={<KakaoCallbackPage />} />
        <Route path="*" element={<NotfoundPage />} />
      </Routes>
    </div>
  )
};

export default App;
