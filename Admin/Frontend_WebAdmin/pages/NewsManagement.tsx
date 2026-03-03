import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { adminApi } from '../services/adminApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Article {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    thumbUrl: string;
    status: 'DRAFT' | 'PUBLISHED' | 'PENDING';
    createdDate: string;
    publishedDate?: string;
    menu: string;
    tags?: string;
    seoTitle?: string;
    seoDescription?: string;
}

export default function NewsManagement() {
    const [view, setView] = useState<'list' | 'edit' | 'preview'>('list');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');

    // Editor states
    const [id, setId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [content, setContent] = useState('');
    const [thumbUrl, setThumbUrl] = useState('');
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'PENDING'>('DRAFT');
    const [menu, setMenu] = useState('homepage');
    const [tags, setTags] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const data = await adminApi.articles.getAll();
            setArticles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleCreate = () => {
        setId(null);
        setTitle('');
        setShortDesc('');
        setContent('');
        setThumbUrl('');
        setStatus('DRAFT');
        setMenu('homepage');
        setTags('');
        setSeoTitle('');
        setSeoDescription('');
        setView('edit');
    };

    const handleEdit = (article: Article) => {
        setId(article.id);
        setTitle(article.title || '');
        setShortDesc(article.shortDescription || '');
        setContent(article.content || '');
        setThumbUrl(article.thumbUrl || '');
        setStatus(article.status || 'DRAFT');
        setMenu(article.menu || 'homepage');
        setTags(article.tags || '');
        setSeoTitle(article.seoTitle || '');
        setSeoDescription(article.seoDescription || '');
        setView('edit');
    };

    const handleSave = async () => {
        if (!title) return alert("Vui lòng nhập tiêu đề");

        const articleData = {
            title,
            shortDescription: shortDesc,
            content,
            thumbUrl,
            status,
            menu,
            tags,
            seoTitle,
            seoDescription
        };

        try {
            if (id) {
                await adminApi.articles.update(id, articleData);
            } else {
                await adminApi.articles.create(articleData);
            }
            setView('list');
            fetchArticles();
        } catch (error) {
            alert("Lỗi khi lưu bài viết");
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageId = await adminApi.images.upload(file);
            const url = adminApi.images.getUrl(imageId);
            setThumbUrl(url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Không thể upload ảnh");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (articleId: string) => {
        if (!confirm("Xóa bài viết này?")) return;
        try {
            await adminApi.articles.delete(articleId);
            fetchArticles();
        } catch (error) {
            alert("Lỗi khi xóa bài viết");
        }
    };

    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || a.status === activeTab;
        return matchesSearch && matchesTab;
    });

    // Preview View
    if (view === 'preview') {
        return (
            <div className="bg-slate-50 min-h-screen -m-8">
                {/* Preview Header */}
                <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('edit')} className="flex items-center gap-2 text-slate-600 font-bold hover:text-purple-600 transition-colors">
                            <i className="fas fa-chevron-left"></i> Quay lại chỉnh sửa
                        </button>
                        <div className="h-6 w-[1px] bg-slate-200"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Chế độ xem trước</span>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm bg-slate-100 rounded-xl">
                            <i className="fas fa-desktop"></i> Máy tính
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-xl">
                            <i className="fas fa-mobile-alt"></i> Điện thoại
                        </button>
                    </div>
                </div>

                {/* Frontend Simulation */}
                <div className="max-w-4xl mx-auto py-12 px-6">
                    <article className="bg-white shadow-2xl shadow-purple-900/5 rounded-[40px] overflow-hidden">
                        {/* Featured Image */}
                        {thumbUrl && (
                            <div className="w-full h-[450px]">
                                <img src={thumbUrl} alt={title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="p-12 md:p-20">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-5 py-2 bg-purple-100 text-purple-700 rounded-2xl text-xs font-black uppercase tracking-wider">{menu}</span>
                                <div className="text-slate-400 text-xs font-bold">• {format(new Date(), 'dd MMMM, yyyy', { locale: vi })}</div>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                                {title || "Chưa có tiêu đề"}
                            </h1>

                            <div className="text-xl text-slate-500 font-medium mb-12 leading-relaxed italic border-l-4 border-purple-200 pl-8">
                                {shortDesc || "Trình tóm tắt bài viết sẽ hiển thị ở đây để người dùng nắm bắt nhanh nội dung..."}
                            </div>

                            <div
                                className="prose prose-purple max-w-none text-slate-700 leading-[1.8] text-lg"
                                dangerouslySetInnerHTML={{ __html: content || "<p className='text-slate-300'>Nội dung bài viết chưa có...</p>" }}
                            />

                            <div className="mt-16 pt-12 border-t border-slate-100 flex flex-wrap gap-2">
                                {tags?.split(',').map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 cursor-pointer transition-colors">#{tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </article>

                    <div className="mt-12 text-center text-slate-400 text-sm font-medium">
                        &copy; 2026 WorkConnect Marketplace. Tất cả quyền được bảo lưu.
                    </div>
                </div>
            </div>
        );
    }

    // Edit View
    if (view === 'edit') {
        return (
            <div className="flex flex-col h-[calc(100vh-80px)] -mx-8 -mb-8 mt-[-32px]">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {/* Editor Header */}
                <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 lg:top-[80px] z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-800">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">
                            {id ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('preview')}
                            className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-eye text-purple-600"></i> Xem trước
                        </button>
                        <button
                            onClick={() => { setStatus('DRAFT'); handleSave(); }}
                            className="px-5 py-2 text-slate-400 font-bold hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Lưu nháp
                        </button>
                        <button
                            onClick={() => { setStatus('PUBLISHED'); handleSave(); }}
                            className="px-6 py-2.5 bg-purple-600 text-white font-black rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all hover:-translate-y-0.5"
                        >
                            {status === 'PUBLISHED' ? 'Cập nhật' : 'Xuất bản'}
                        </button>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 overflow-hidden flex bg-[#f8f9fa]">
                    {/* Main Area */}
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <input
                                type="text"
                                placeholder="Nhập tiêu đề tại đây..."
                                className="w-full bg-transparent text-4xl font-black text-slate-900 placeholder:text-slate-200 border-none outline-none focus:ring-0"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                            ['link', 'image', 'video'],
                                            ['clean']
                                        ],
                                    }}
                                    className="flex-1"
                                />
                            </div>

                            {/* SEO Section */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-search text-purple-600"></i> Cấu hình SEO
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">SEO Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-slate-100 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                                            value={seoTitle}
                                            onChange={e => setSeoTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">SEO Description</label>
                                        <textarea
                                            className="w-full px-4 py-2 border border-slate-100 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-20 font-medium"
                                            value={seoDescription}
                                            onChange={e => setSeoDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-80 border-l border-slate-200 bg-white p-8 pt-12 overflow-y-auto custom-scrollbar space-y-8 shadow-2xl">
                        {/* Status Box */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trình trạng</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold items-center">
                                    <span className="text-slate-500">Trạng thái:</span>
                                    <span className={`px-2 py-0.5 rounded ${status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs font-bold items-center">
                                    <span className="text-slate-500">Đăng bởi:</span>
                                    <span className="text-slate-800">Hung Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ảnh đại diện thực tế</h4>
                            <div className="space-y-4">
                                <div
                                    onClick={handleUploadClick}
                                    className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group relative cursor-pointer hover:border-purple-400 transition-colors"
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <i className="fas fa-spinner fa-spin text-purple-600 text-2xl"></i>
                                            <span className="text-[10px] font-black text-slate-400">Đang tải...</span>
                                        </div>
                                    ) : thumbUrl ? (
                                        <img src={thumbUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-slate-300 text-3xl mb-2 group-hover:text-purple-400 transition-colors"></i>
                                            <span className="text-[10px] font-black text-slate-400">TẢI ẢNH THỰC TẾ LÊN</span>
                                        </>
                                    )}
                                    {thumbUrl && !isUploading && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-black underline">THAY ĐỔI</span>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">URL</span>
                                    <input
                                        type="text"
                                        placeholder="Hoặc dán link tại đây..."
                                        className="w-full text-[10px] font-bold pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
                                        value={thumbUrl}
                                        onChange={e => setThumbUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categories / Menu */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Chuyên mục</h4>
                            <div className="space-y-2">
                                {['homepage', 'news', 'handbook', 'hot'].map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="radio"
                                                name="menu"
                                                className="peer w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                                                checked={menu === cat}
                                                onChange={() => setMenu(cat)}
                                            />
                                        </div>
                                        <span className={`text-xs font-bold transition-colors ${menu === cat ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                            {cat.toUpperCase()}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Thẻ (Tags)</h4>
                            <input
                                type="text"
                                placeholder="Ngăn cách bởi dấu phẩy..."
                                className="w-full text-xs font-bold px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tóm tắt ngắn</h4>
                            <textarea
                                className="w-full text-xs font-medium px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24 italic leading-relaxed"
                                placeholder="Mô tả tóm tắt cho bài viết..."
                                value={shortDesc}
                                onChange={e => setShortDesc(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bài viết</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Quản lý và biên tập nội dung hệ thống.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Viết bài mới
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                        <i className="fas fa-file-lines"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{articles.length}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng bài viết</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{articles.filter(a => a.status === 'PUBLISHED').length}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã công khai</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                        <i className="fas fa-pen-nib"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{articles.filter(a => a.status === 'DRAFT').length}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài viết nháp</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                        <i className="fas fa-eye"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">12.5k</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lượt xem bài</div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-100">
                <div className="flex gap-1">
                    {(['all', 'PUBLISHED', 'DRAFT'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab === 'all' ? 'Tất cả' : tab}
                        </button>
                    ))}
                </div>
                <div className="relative mr-2">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="pl-11 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-80 focus:ring-2 focus:ring-purple-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Articles Table/List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề - Tóm tắt</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</td></tr>
                        ) : filteredArticles.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Trống</td></tr>
                        ) : filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-slate-50/80 transition-all group">
                                <td className="px-8 py-6 max-w-md">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                                            <img src={article.thumbUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-sm group-hover:text-purple-600 transition-colors line-clamp-1">{article.title}</div>
                                            <div className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-1">{article.shortDescription}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                        {article.menu || 'GENERAL'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${article.status === 'PUBLISHED' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-[11px] font-bold text-slate-500 uppercase">
                                    {format(new Date(article.createdDate), 'dd MMM, yyyy', { locale: vi })}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(article)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                            title="Chỉnh sửa chi tiết"
                                        >
                                            <i className="fas fa-pen-nib"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Xóa bài viết"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
