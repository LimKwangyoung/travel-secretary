import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import styles from '@/styles/LoadingPage.module.css'
import axiosInstance from '@/axios.js'

const LoadingPage = () => {

  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
    </div>
  )
};

export default LoadingPage;