import React, { useState } from 'react';

const ARTICLES = [
  // Mẹo viết CV
  { 
    id: 1, 
    title: 'Viết CV như thế nào cho chuẩn và ấn tượng? - TopCV', 
    category: 'Mẹo viết CV', 
    img: 'https://picsum.photos/600/400?random=1',
    excerpt: 'Bao gồm các thông tin họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ liên lạc. Các thông tin này sẽ giúp nhà tuyển dụng dễ dàng liên hệ với ...',
    url: 'https://www.topcv.vn/viet-cv-the-nao-cho-chuan'
  },
  { 
    id: 2, 
    title: 'Cách viết CV cho mọi ngành chuẩn nhất, tăng cơ hội trúng tuyển', 
    category: 'Mẹo viết CV', 
    img: 'https://picsum.photos/600/400?random=2',
    excerpt: 'Mẹo viết CV ấn tượng, thu hút nhà tuyển dụng · Tập trung vào thông tin chính · Sắp xếp thông tin hợp lý · Không mắc lỗi chính tả, chỉnh chu văn phong · Thể hiện sự ...',
    url: 'https://careerviet.vn/vi/talentcommunity/cach-viet-cv-xin-viec-dung-chuan-an-tuong-cho-moi-nganh-nghe.35A4EC6D.html'
  },
  { 
    id: 3, 
    title: 'Bí quyết viết CV ấn tượng, thu hút nhà tuyển dụng ngay lập tức', 
    category: 'Mẹo viết CV', 
    img: 'https://picsum.photos/600/400?random=3',
    excerpt: 'Các nội dung cần có trong một chiếc CV xin việc chuẩn · Bí quyết viết CV ấn tượng chinh phục nhà tuyển dụng · Lưu ý hình ảnh trong CV · Chỉ liệt kê ...',
    url: 'https://tuyendungmektec.vn/bi-quyet-viet-cv-an-tuong-thu-hut-nha-tuyen-dung-cd1088'
  },
  { 
    id: 4, 
    title: 'Mẹo viết Kinh nghiệm làm việc trong CV - Điểm sáng thu hút nhà ...', 
    category: 'Mẹo viết CV', 
    img: 'https://picsum.photos/600/400?random=4',
    excerpt: 'Ngoài ra, hãy đề cập đến bất kỳ sở thích hoặc hoạt động nào có thể liên quan đến vị trí bạn đang ứng tuyển. Điều này cho thấy bạn có sự đam mê ...',
    url: 'https://job.isvnu.vn/kinh-nghiem-lam-viec-trong-cv-news9189'
  },
  { 
    id: 5, 
    title: 'Danh sách mẫu CV xin việc chuẩn - miễn phí mới nhất 2025', 
    category: 'Mẹo viết CV', 
    img: 'https://picsum.photos/600/400?random=5',
    excerpt: 'CV: Hỗ trợ nhà tuyển dụng đánh giá và chọn ra ứng viên phù hợp nhất cho vị trí công việc. Một bản CV thường chứa đựng các thông tin như kinh nghiệm làm việc, ...',
    url: 'https://vieclam24h.vn/cv/danh-sach-cv.html'
  },

  // Phỏng vấn
  { 
    id: 6, 
    title: '10 hình thức phỏng vấn phổ biến nhất 2024 - VietnamWorks', 
    category: 'Phỏng vấn', 
    img: 'https://picsum.photos/600/400?random=6',
    excerpt: 'Gặp gỡ trực tiếp nhiều nhà tuyển dụng tiềm năng trong một thời gian ngắn. · Tạo ấn tượng ban đầu và giới thiệu bản thân một cách nhanh chóng.',
    url: 'https://www.vietnamworks.com/hrinsider/hinh-thuc-phong-van.html'
  },
  { 
    id: 7, 
    title: '10 Bí Kíp Phỏng Vấn Ít Người Biết (Đã Áp Dụng Thành Công!)', 
    category: 'Phỏng vấn', 
    img: 'https://picsum.photos/600/400?random=7',
    excerpt: 'Chuẩn bị kỹ lưỡng: Nghiên cứu kỹ về công ty và vị trí ứng tuyển để có thể trả lời các câu hỏi phỏng vấn một cách tự tin và chính xác. · Luyện tập ...',
    url: 'https://athenacorp.vn/10-bi-kip-phong-van-thanh-cong-ma-it-nguoi-biet/'
  },
  { 
    id: 8, 
    title: '16 Tips phỏng vấn quan trọng giúp bạn xin việc thành công', 
    category: 'Phỏng vấn', 
    img: 'https://picsum.photos/600/400?random=8',
    excerpt: 'Lắng nghe câu hỏi một cách cẩn thận là yếu tố cần thiết trong buổi phỏng vấn. Khi bạn nghe rõ và hiểu chính xác yêu cầu của nhà tuyển dụng, bạn sẽ có cơ hội trả ...',
    url: 'https://vieclam24h.vn/nghe-nghiep/la-ban-su-nghiep/6-ky-nang-tra-loi-phong-van-xin-viec-nhat-dinh-phai-nam-ro'
  },
  { 
    id: 9, 
    title: 'Áp dụng quy tắc 7-38-55 để thành công trong mọi cuộc phỏng vấn', 
    category: 'Phỏng vấn', 
    img: 'https://picsum.photos/600/400?random=9',
    excerpt: 'Áp dụng quy tắc 7-38-55 để chinh phục mọi cuộc phỏng vấn. Hãy tưởng tượng bạn đang chuẩn bị thật kỹ lưỡng cho một buổi phỏng vấn vô cùng quan ...',
    url: 'https://www.elle.vn/bi-quyet-song/quy-tac-7-38-55-de-phong-van/'
  },
  { 
    id: 10, 
    title: 'TOP 30 câu hỏi phỏng vấn thường gặp nhất ứng viên cần biết', 
    category: 'Phỏng vấn', 
    img: 'https://picsum.photos/600/400?random=10',
    excerpt: 'Bạn làm thế nào để hoàn thành công việc đúng thời hạn? Bạn nên khẳng định, bản thân luôn biết cách quản lý công việc thông qua việc chủ động ...',
    url: 'https://www.topcv.vn/cau-hoi-phong-van-thuong-gap-nhat-ung-vien-can-biet'
  },

  // Lương thưởng
  { 
    id: 11, 
    title: 'Đàm phán lương hiệu quả: Cách giúp bạn nhận đúng giá trị công việc', 
    category: 'Lương thưởng', 
    img: 'https://picsum.photos/600/400?random=11',
    excerpt: 'Bí quyết đàm phán lương hiệu quả giúp bạn nhận đúng giá trị công việc, tăng cơ hội nhận thêm phúc lợi, cổ phiếu và tiền thưởng.',
    url: 'https://raovathouston.com/tretoday/dam-phan-luong-hieu-qua/'
  },
  { 
    id: 12, 
    title: 'Mách khéo 13 cách đàm phán lương sau khi được mời làm việc', 
    category: 'Lương thưởng', 
    img: 'https://picsum.photos/600/400?random=12',
    excerpt: 'Một nguyên tắc cơ bản trong đàm phán lương là đưa ra cho nhà tuyển dụng một con số cao hơn một chút so với mục tiêu của bạn. Bằng cách này, nếu ...',
    url: 'https://hrchannels.com/uptalent/mach-kheo-13-cach-dam-phan-luong-sau-khi-duoc-moi-lam-viec.html'
  },
  { 
    id: 13, 
    title: 'Deal lương là gì? Bỏ túi cách deal lương khéo léo - TopCV', 
    category: 'Lương thưởng', 
    img: 'https://picsum.photos/600/400?random=13',
    excerpt: 'Thời gian thích hợp nhất để ứng viên vừa ra trường để đàm phán về vấn đề lương bổng là từ 3 - 6 tháng thử việc. Lúc này, ứng viên sẽ có độ chín ...',
    url: 'https://www.topcv.vn/cach-deal-luong-kheo-leo'
  },
  { 
    id: 14, 
    title: 'Deal lương là gì? Cách đàm phán lương thành công khi phỏng vấn', 
    category: 'Lương thưởng', 
    img: 'https://picsum.photos/600/400?random=14',
    excerpt: 'Tìm hiểu chiến thuật đàm phán lương chuyên nghiệp để đạt kết quả tốt nhất. Bài viết này sẽ hướng dẫn bạn cách deal lương hiệu quả và chuẩn ...',
    url: 'https://www.aia.com.vn/vi/song-khoe/loi-khuyen/nghe-nghiep/deal-luong-la-gi.html'
  },
  { 
    id: 15, 
    title: 'Cách Đàm Phán Lương & Phúc Lợi Hợp Lý Trong Phỏng Vấn', 
    category: 'Lương thưởng', 
    img: 'https://picsum.photos/600/400?random=15',
    excerpt: 'Đừng vội nhắc đến lương ngay vòng phỏng vấn đầu. Hãy để Nhà tuyển dụng thể hiện sự quan tâm trước. Thời điểm tốt nhất để đàm phán là: sau khi nhận ...',
    url: 'https://www.linkedin.com/pulse/c%25C3%25A1ch-%25C4%2591%25C3%25A0m-ph%25C3%25A1n-l%25C6%25B0%25C6%25A1ng-ph%25C3%25BAc-l%25E1%25BB%25A3i-h%25E1%25BB%25A3p-l%25C3%25BD-trong-ph%25E1%25BB%258Fng-v%25E1%25BA%25A5n-4dzcc'
  },

  // Kỹ năng mềm
  { 
    id: 16, 
    title: 'Kỹ năng mềm là gì? Top 10 kỹ năng mềm quan trọng cần có - PACE', 
    category: 'Kỹ năng mềm', 
    img: 'https://picsum.photos/600/400?random=16',
    excerpt: 'Kỹ năng mềm là gì? Top 10 kỹ năng mềm quan trọng cần có · Kỹ năng giao tiếp · Khả năng lãnh đạo · Kỹ năng giải quyết vấn đề · Kỹ năng lắng nghe · Kỹ năng quan sát ...',
    url: 'https://www.pace.edu.vn/tin-kho-tri-thuc/ky-nang-mem-la-gi'
  },
  { 
    id: 17, 
    title: '32 kỹ năng mềm cần thiết cho thành công trong công việc và cuộc ...', 
    category: 'Kỹ năng mềm', 
    img: 'https://picsum.photos/600/400?random=17',
    excerpt: '32 kỹ năng mềm cần thiết cho thành công trong công việc và cuộc sống - Khóa học CEO · 1. Kỹ năng học tập, nghiên cứu · 2. Kỹ năng giao tiếp · 3. Kỹ năng viết · 4.',
    url: 'https://khoahocceo.edu.vn/chi-tiet/32-ky-nang-mem-can-thiet-cho-thanh-cong-trong-cong-viec-va-cuoc-song-82'
  },
  { 
    id: 18, 
    title: '20 kỹ năng mềm cần thiết, quan trọng đưa bạn tới thành công', 
    category: 'Kỹ năng mềm', 
    img: 'https://picsum.photos/600/400?random=18',
    excerpt: 'Kỹ năng mềm giúp xây dựng mối quan hệ tốt, thúc đẩy sự phát triển cá nhân, và là yếu tố quan trọng trong việc đạt được thành công trong công ...',
    url: 'https://vinwonders.com/vi/wonderpedia/news/ky-nang-mem-la-gi/'
  },
  { 
    id: 19, 
    title: '7 kỹ năng mềm cho sinh viên để thành công trong mọi công việc', 
    category: 'Kỹ năng mềm', 
    img: 'https://picsum.photos/600/400?random=19',
    excerpt: 'Việc giữ thái độ bình tĩnh và có thái độ ứng xử phù hợp trước những lời phê bình là vô cùng cần thiết, nó phản ánh thái độ cầu thị, cầu tiến của một nhân viên.',
    url: 'https://hcmussh.edu.vn/news/item/5535'
  },
  { 
    id: 20, 
    title: '10 kỹ năng mềm cần thiết giúp bạn thành công trong 2025 - Elle.vn', 
    category: 'Kỹ năng mềm', 
    img: 'https://picsum.photos/600/400?random=20',
    excerpt: 'Kỹ năng mềm (soft skills) là kỹ năng liên quan đến trí tuệ cảm xúc, đây là nhóm kỹ năng thể hiện khả năng hòa nhập, thích nghi, tương tác với xã ...',
    url: 'https://www.elle.vn/bi-quyet-song/ky-nang-mem-can-thiet-giup-ban-thanh-cong-trong-2025/'
  },

  // Xu hướng thị trường
  { 
    id: 21, 
    title: 'Thông cáo báo chí về tình hình lao động, việc làm quý IV và năm 2024', 
    category: 'Xu hướng thị trường', 
    img: 'https://picsum.photos/600/400?random=21',
    excerpt: 'Tính chung năm 2024, lao động có việc làm là 51,9 triệu người, tăng 585,1 nghìn người (tương ứng tăng 1,1%) so với năm trước. Trong đó, khu vực thành thị là 19, ...',
    url: 'https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2025/01/thong-cao-bao-chi-ve-tinh-hinh-lao-dong-viec-lam-quy-iv-va-nam-2024/'
  },
  { 
    id: 22, 
    title: 'Xu hướng 2024 Triển vọng Việc làm và Xã hội Thế giới', 
    category: 'Xu hướng thị trường', 
    img: 'https://picsum.photos/600/400?random=22',
    excerpt: 'Khoảng cách việc làm toàn cầu cũng được cải thiện trong năm 2023, nhưng vẫn ở mức cao gần 435 triệu. Hơn nữa, trong năm 2023, tỷ lệ tham gia thị trường lao động.',
    url: 'https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40asia/%40ro-bangkok/%40ilo-hanoi/documents/publication/wcms_908191.pdf'
  },
  { 
    id: 23, 
    title: 'Xu hướng thị trường việc làm sau tốt nghiệp năm 2024 - UEH', 
    category: 'Xu hướng thị trường', 
    img: 'https://picsum.photos/600/400?random=23',
    excerpt: 'Năm 2024, UEH Sharing – Career Fair dự kiến thu hút hơn 60 gian hàng Nhà tuyển dụng tham gia tuyển dụng đến từ các lĩnh vực Ngân hàng – Tài chính – Bảo hiểm, ...',
    url: 'https://ueh.edu.vn/cuoc-song-ueh/tin-tuc/xu-huong-thi-truong-viec-lam-sau-tot-nghiep-nam-2024-71546'
  },
  { 
    id: 24, 
    title: 'Năm 2024: Thị trường lao động phục hồi nhanh, mạnh mẽ', 
    category: 'Xu hướng thị trường', 
    img: 'https://picsum.photos/600/400?random=24',
    excerpt: 'Theo Tổng cục Thống kê, tình hình lao động, việc làm năm 2024 đã quay trở lại theo xu hướng phát triển bình thường như thời kỳ trước dịch Covid- ...',
    url: 'https://molisa.gov.vn/baiviet/242702'
  },
  { 
    id: 25, 
    title: 'Thị Trường Lao Động Của Việt Nam: Các Điểm Nổi Bật Trong Quý 3 ...', 
    category: 'Xu hướng thị trường', 
    img: 'https://picsum.photos/600/400?random=25',
    excerpt: '... Thị trường Lao động TP.HCM (Falmi), thành phố đã tạo ra khoảng 60.000 việc làm trong quý 3 năm 2024. Đây là mức tăng 3,5% so với cùng kỳ năm ...',
    url: 'https://www.reeracoen.com.vn/en/articles/thi-truong-lao-dong-cua-viet-nam-cac-diem-noi-bat-trong-quy-3-nam-2024'
  },

  // Góc chuyên gia
  { 
    id: 26, 
    title: 'Lời khuyên của chuyên gia tuyển dụng: Gen Z nhớ ăn mặc tử tế khi ...', 
    category: 'Góc chuyên gia', 
    img: 'https://picsum.photos/600/400?random=26',
    excerpt: 'Theo Levine, nếu bạn phỏng vấn từ nhà, hãy ngồi tại bàn làm việc, bàn ăn "hoặc bất kỳ khu vực nào có phông nền chuyên nghiệp" và phòng sạch sẽ.',
    url: 'https://tuoitre.vn/loi-khuyen-cua-chuyen-gia-tuyen-dung-gen-z-nho-an-mac-tu-te-khi-phong-van-20240826053117942.htm'
  },
  { 
    id: 27, 
    title: 'Những lời khuyên của một chuyên gia săn đầu người - Vieclam24h', 
    category: 'Góc chuyên gia', 
    img: 'https://picsum.photos/600/400?random=27',
    excerpt: 'Cùng đọc những lời khuyên từ những chuyên gia săn đầu người cho các công ty lớn có thể sẽ giúp bạn trở thành một nhà tuyển dụng tài năng.',
    url: 'https://vieclam24h.vn/nghe-nghiep/tuyen-dung-hieu-qua/nhung-loi-khuyen-cua-mot-chuyen-gia-san-dau-nguoi'
  },
  { 
    id: 28, 
    title: '10 lời khuyên giúp nâng cao hiệu quả của quy trình tuyển dụng', 
    category: 'Góc chuyên gia', 
    img: 'https://picsum.photos/600/400?random=28',
    excerpt: '10 lời khuyên giúp nâng cao hiệu quả của quy trình tuyển dụng · 1. Sử dụng hệ thống quản lý tuyển dụng (ATS) · 2. Viết mô tả công việc chi tiết, ngắn gọn · 3. Giữ ...',
    url: 'https://vn.joboko.com/blog/10-loi-khuyen-giup-nang-cao-hieu-qua-cua-quy-trinh-tuyen-dung-nwi1493'
  },
  { 
    id: 29, 
    title: '10 lời khuyên đáng suy nghĩ dành cho sinh viên khi tìm kiếm việc làm', 
    category: 'Góc chuyên gia', 
    img: 'https://picsum.photos/600/400?random=29',
    excerpt: 'Các chuyên gia khuyên sinh viên chú ý tự chăm sóc bản thân và thỉnh thoảng tạm dừng việc nộp đơn ứng tuyển.',
    url: 'https://khoakhpt.neu.edu.vn/vi/tin-tuc-1591/10-loi-khuyen-dang-suy-nghi-danh-cho-sinh-vien-khi-tim-kiem-viec-lam'
  },
  { 
    id: 30, 
    title: 'SHRM - THIẾT LẬP NƠI LÀM VIỆC LÝ TƯỞNG NHẤT NHỜ 14 LỜI ...', 
    category: 'Góc chuyên gia', 
    img: 'https://picsum.photos/600/400?random=30',
    excerpt: 'Để trở thành nơi làm việc tốt nhất, trước tiên một công ty phải thuê những người giỏi nhất, sau đó đào tạo và đầu tư vào họ. Đầu tư vào nhân viên bắt đầu với ...',
    url: 'https://www.pace.edu.vn/shrm/kho-tri-thuc/thiet-lap-noi-lam-viec-ly-tuong-nhat-nho-14-loi-khuyen-cua-cac-chuyen-gia-tuyen-dung-hang-dau'
  }
];

const CareerResources: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredArticles = ARTICLES.filter(article => {
    const matchTopic = activeTopic === 'Tất cả' || article.category === activeTopic;
    const matchSearch = !searchTerm || article.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTopic && matchSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction: 'prev' | 'next' | number) => {
    if (typeof direction === 'number') {
      setCurrentPage(direction);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans">
      <div className="max-w-[1128px] mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white rounded-lg border border-gray-300 p-4 -mt-2 mb-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h1 className="text-2xl font-bold text-gray-900">Cẩm nang nghề nghiệp</h1>
              <p className="text-sm text-gray-500 mt-1">Khám phá kiến thức, kỹ năng và xu hướng mới nhất.</p>
           </div>
           {/* Search in Resources */}
           <div className="relative w-full md:w-80">
              <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input 
                 type="text" 
                 placeholder="Tìm kiếm bài viết, chủ đề..." 
                 className="w-full pl-3 pr-4 py-2 bg-[#eef3f8] rounded-md text-sm outline-none focus:bg-white focus:ring-1 focus:ring-gray-800 transition-all"
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* === LEFT SIDEBAR: TOPICS === */}
           <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
                 <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Chủ đề phổ biến</h3>
                 <div className="flex flex-col gap-1">
                    {['Tất cả', 'Mẹo viết CV', 'Phỏng vấn', 'Lương thưởng', 'Kỹ năng mềm', 'Xu hướng thị trường', 'Góc chuyên gia'].map((tag, i) => (
                       <button 
                         key={i} 
                         onClick={() => { setActiveTopic(tag); setCurrentPage(1); }}
                         className={`text-left px-3 py-2 rounded text-sm font-semibold transition-colors ${activeTopic === tag ? 'bg-[#eef3f8] text-[#4c42bd] border-l-4 border-[#4c42bd]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'}`}>
                          {tag}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Newsletter Promo */}
              <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm text-center">
                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                    <i className="far fa-envelope text-xl"></i>
                 </div>
                 <h3 className="text-sm font-bold text-gray-900">Đăng ký nhận tin</h3>
                 <p className="text-xs text-gray-500 mt-1 mb-3">Nhận bài viết mới nhất qua email hàng tuần.</p>
                 <button className="w-full py-1.5 rounded-full border border-[#4c42bd] text-[#4c42bd] font-bold text-sm hover:bg-blue-50 transition-colors">Đăng ký ngay</button>
              </div>
           </div>

           {/* === MAIN CONTENT: ARTICLES GRID === */}
           <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {paginatedArticles.map(article => (
                    <div key={article.id} className="bg-white rounded-lg border border-gray-300 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full">
                       <div className="aspect-video overflow-hidden relative">
                          <img src={article.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                             {article.category}
                          </div>
                       </div>
                       <div className="p-4 flex flex-col flex-grow">
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4c42bd] group-hover:underline leading-snug">
                               {article.title}
                            </h3>
                          </a>
                          <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                             {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                <span className="text-xs text-gray-500 font-semibold">Bởi WorkConnect Team</span>
                             </div>
                             <span className="text-xs text-gray-400">5 phút đọc</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                 <button 
                   onClick={() => handlePageChange('prev')}
                   disabled={currentPage === 1}
                   className="px-4 py-2 border border-gray-300 bg-white rounded-l-md hover:bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-50">Trước</button>
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <button 
                     key={page}
                     onClick={() => handlePageChange(page)}
                     className={`px-4 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-100 font-bold text-sm ${currentPage === page ? 'text-gray-900' : 'text-gray-600'}`}>
                       {page}
                     </button>
                 ))}
                 <button 
                   onClick={() => handlePageChange('next')}
                   disabled={currentPage === totalPages}
                   className="px-4 py-2 border border-gray-300 bg-white rounded-r-md hover:bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-50">Sau</button>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default CareerResources;