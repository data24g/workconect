import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Tự động cuộn lên đầu khi chuyển trang
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [pathname]);

    // Theo dõi vị trí cuộn để hiển thị nút
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[999] bg-[#4c42bd] text-white w-12 h-12 rounded-full shadow-2xl hover:bg-[#3a32a0] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
                    title="Cuộn lên đầu trang"
                >
                    <i className="fas fa-arrow-up text-lg group-hover:-translate-y-1 transition-transform duration-300"></i>

                    {/* Hiệu ứng sóng nhẹ khi hover */}
                    <span className="absolute inset-0 rounded-full bg-[#4c42bd] animate-ping opacity-20 group-hover:block hidden"></span>
                </button>
            )}
        </>
    );
};

export default ScrollToTop;
