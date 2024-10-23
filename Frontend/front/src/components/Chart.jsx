import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react'; // ECharts for React
import axiosInstance from '@/axios'; // axiosInstance import
import { useParams } from 'react-router-dom';
import styles from './styles/Chart.module.css';
import airplaneIcon from '@/assets/images/category/airplane.png';
import cafeIcon from '@/assets/images/category/cafe.png';
import etcIcon from '@/assets/images/category/etc.png';
import foodIcon from '@/assets/images/category/food.png';
import hotelIcon from '@/assets/images/category/hotel.png';
import shoppingIcon from '@/assets/images/category/shopping.png';
import tourIcon from '@/assets/images/category/tour.png';
import vehicleIcon from '@/assets/images/category/vehicle.png';
import LoadingPage from '@/pages/LoadingPage'

const Chart = () => {
  const { tripId } = useParams(); // URL에서 tripId 추출
  const [chartData, setChartData] = useState(null); // 차트 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태

  const categoryIcons = {
    항공: airplaneIcon,
    카페: cafeIcon,
    기타: etcIcon,
    식비: foodIcon,
    숙소: hotelIcon,
    쇼핑: shoppingIcon,
    관광: tourIcon,
    교통: vehicleIcon,
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axiosInstance.get('/payments/list/', {
          params: { trip_id: tripId }, // trip_id를 params로 전달
        });
        const payments = response.data.payments_list;

        if (payments && payments.length > 0) {
          // 각 category별로 지출 합계를 계산
          const categoryTotals = {};
          payments.forEach(payment => {
            const category = payment.category;
            const amount = payment.amount;

            if (categoryTotals[category]) {
              categoryTotals[category] += amount;
            } else {
              categoryTotals[category] = amount;
            }
          });

          // 차트 데이터 설정
          const labels = Object.keys(categoryTotals);
          const data = Object.values(categoryTotals);

          setChartData({
            labels,
            data,
          });
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [tripId]);

  // ECharts 옵션 설정
  const getChartOptions = () => {
    if (!chartData) return {};

    return {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const iconUrl = categoryIcons[params.name];
          return `
            <div style="display: flex; align-items: center;">
              <img src="${iconUrl}" style="width: 20px; height: 20px; margin-right: 5px;" />
              <strong style="font-size:14px;">${params.name}</strong>
            </div>
            <div style="font-size:16px; color:${params.color};">${params.value.toLocaleString()}원</div>
            <div style="font-size:12px;">${params.percent}%</div>
          `;
        },
        textStyle: {
          fontFamily: "Spoqa Han Sans Neo", // 툴팁 글씨체 지정
        },
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: "3%",
        itemGap: 20, // 아이템 간격 조정
        width: '85%', // 너비를 조정하여 4개의 카테고리가 한 줄에 표시되도록 설정
        textStyle: {
          fontFamily: "Spoqa Han Sans Neo", // legend 글씨체 지정
          fontSize: 14,
        },
      },
      color: [
        "#becaf4",
        "#a2b4ef",
        "#849ae9",
        "#728de8",
        "#5f7dd6",
        "#4d69b4",
        "#5a70ae",
        "#415795",
      ],
      series: [
        {
          name: '지출 내역',
          type: 'pie',
          radius: '50%',
          center: ["50%", "40%"], // 차트를 정가운데에 위치
          data: chartData.labels.map((label, index) => ({
            name: label,
            value: chartData.data[index],
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            formatter: function (params) {
              // params.percent의 정수 부분만 사용
              const percentage = Math.floor(params.percent);
              return `{nameStyle|${params.name}}\n{percentStyle|${percentage}%}`;
            },
            rich: {
              nameStyle: {
                fontSize: 12,
                fontFamily: "Spoqa Han Sans Neo",
                fontWeight: "bold",
                color: "#333",
              },
              percentStyle: {
                fontSize: 12,
                fontFamily: "Spoqa Han Sans Neo",
                color: "#999",
              },
            },
          },
        },
      ],
    };
  };

  if (loading) return <LoadingPage />;
  if (error) return <div>Error: {error.message}</div>;
  if (!chartData) return <div>차트 데이터를 불러오지 못했습니다.</div>;

  return (
    <div className={styles.paymentTrip}>
      <div className={styles.title}>💰 나의 지출</div>
      <div className={styles.content}>
        <ReactECharts option={getChartOptions()} style={{ height: '400px', width: '100%' }} />
      </div>
    </div>
  );
};

export default Chart;
