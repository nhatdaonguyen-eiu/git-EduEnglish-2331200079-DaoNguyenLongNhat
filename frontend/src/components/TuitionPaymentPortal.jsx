import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TuitionPaymentPortal({ currentUser, onBackToDashboard }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentConfigs, setPaymentConfigs] = useState([]);

  // Read URL query parameters
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const method = params.get('method');

  useEffect(() => {
    if (orderId) {
      fetchPaymentByOrderId(orderId);
    }
    fetchPaymentConfigs();
  }, [orderId]);

  const fetchPaymentConfigs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/payment-configs');
      setPaymentConfigs(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy cấu hình thanh toán:', err);
    }
  };

  const fetchPaymentByOrderId = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8080/api/payments/order/${id}`);
      setPaymentDetails(response.data);
      if (response.data.status === 'PAID') {
        setPaymentSuccess(true);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', err);
      setError('Không tìm thấy thông tin đơn hàng thanh toán này.');
    } finally {
      setLoading(false);
    }
  };

  // Process checkout submission (Student confirms they did the manual bank transfer)
  const handleConfirmMockPayment = async () => {
    if (!paymentDetails) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`http://localhost:8080/api/payments/submit-approval?orderId=${paymentDetails.orderId}`);
      setPaymentDetails(response.data);
      if (response.data.status === 'PENDING_APPROVAL') {
        setPaymentSuccess(true);
        alert('🎉 Yêu cầu thanh toán của bạn đã được gửi thành công! Vui lòng chờ Manager đối chiếu và phê duyệt.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu xác thực thanh toán:', err);
      setError('Giao dịch chưa thể gửi yêu cầu xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Standard formatting for currency VND
  const formatVND = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Generate QR Code mockup using standard APIs or styling (Option A)
  const getSimulatedQRCode = () => {
    if (!paymentDetails) return '';
    const activeConfig = paymentConfigs.find(c => c.gatewayKey === (method || paymentDetails.method)) || {};
    if (activeConfig.qrUrl) {
      return activeConfig.qrUrl; // Option A: Static uploaded QR template image
    }
    // Dynamic QR generation
    const bankName = activeConfig.gatewayName || 'Techcombank';
    const acctNum = activeConfig.accountNumber || '1903456789012';
    const text = encodeURIComponent(
      `BANK: ${bankName} - ACCT: ${acctNum} - AMOUNT: ${paymentDetails.amount} - SYNTAX: ${paymentDetails.transferSyntax}`
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`;
  };

  if (loading && !paymentDetails) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm">Đang kết nối cổng thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center text-4xl rounded-2xl mx-auto mb-4">
          ⚠️
        </div>
        <h3 className="text-lg font-black text-slate-800">Lỗi giao dịch</h3>
        <p className="text-slate-500 text-xs mt-2 font-medium">{error}</p>
        <button
          onClick={onBackToDashboard}
          className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
        >
          Quay lại Cổng Học Tập
        </button>
      </div>
    );
  }

  // --- RENDER SUCCESS/SUBMITTED STATE ---
  if (paymentSuccess && paymentDetails) {
    const isApproved = paymentDetails.status === 'PAID';
    return (
      <div className="max-w-lg mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center animate-fade-in">
        {isApproved ? (
          <div className="w-20 h-20 bg-green-50 text-green-500 flex items-center justify-center text-5xl rounded-3xl mx-auto mb-6 shadow-inner animate-bounce">
            ✓
          </div>
        ) : (
          <div className="w-20 h-20 bg-amber-50 text-amber-500 flex items-center justify-center text-5xl rounded-3xl mx-auto mb-6 shadow-inner animate-pulse">
            ⏳
          </div>
        )}
        
        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${
          isApproved 
            ? 'bg-green-50 text-green-600 border border-green-200' 
            : 'bg-amber-50 text-amber-600 border border-amber-200'
        }`}>
          {isApproved ? 'Giao Dịch Thành Công' : 'Đang Chờ Manager Phê Duyệt'}
        </span>
        
        <h2 className="text-2xl font-black text-slate-800 mt-4">
          {isApproved ? 'Xác Nhận Đóng Học Phí' : 'Đã Gửi Yêu Cầu Xác Thực'}
        </h2>
        <p className="text-slate-400 text-[11px] font-semibold mt-1 uppercase tracking-wider">
          Mã hóa đơn: {paymentDetails.orderId}
        </p>

        <div className="my-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/50 text-left flex flex-col gap-3">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-400 font-semibold">Học viên</span>
            <span className="text-xs text-slate-800 font-bold">{paymentDetails.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-400 font-semibold">Lớp học đăng ký</span>
            <span className="text-xs text-slate-800 font-bold">{paymentDetails.className}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-400 font-semibold">Khóa học</span>
            <span className="text-xs text-slate-800 font-bold">{paymentDetails.courseTitle}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-400 font-semibold">Số tiền thanh toán</span>
            <span className="text-xs text-orange-600 font-black">{formatVND(paymentDetails.amount)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-400 font-semibold">Hình thức thanh toán</span>
            <span className="text-xs text-slate-800 font-bold">{paymentDetails.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-semibold">Trạng thái</span>
            <span className={`text-xs font-black ${isApproved ? 'text-green-600' : 'text-amber-600'}`}>
              {isApproved ? 'ĐÃ ĐÓNG' : 'CHỜ DUYỆT'}
            </span>
          </div>
        </div>

        {isApproved ? (
          <div className="bg-orange-50/50 border border-orange-200/60 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-orange-600 flex items-center gap-1.5">
              📧 Email Gửi Hóa Đơn Tự Động:
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Hóa đơn chi tiết đã được gửi giả lập tới hòm thư <strong>{paymentDetails.studentEmail}</strong>. Bạn cũng có thể xem và tải bản in hóa đơn ngay bên dưới.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              ⏳ Đang Chờ Đối Chiếu Thủ Công:
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Manager sẽ kiểm tra tài khoản ngân hàng của trung tâm để xác minh giao dịch của bạn qua cú pháp chuyển tiền. Hóa đơn điện tử sẽ tự động được gửi qua email cho bạn sau khi giao dịch được phê duyệt thành công.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isApproved && (
            <a
              href={`http://localhost:8080${paymentDetails.invoiceUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/10 cursor-pointer text-center"
            >
              📄 Xem & Tải Hóa Đơn
            </a>
          )}
          <button
            onClick={onBackToDashboard}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
          >
            Về Trang Cổng Học Tập 🏠
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER SIMULATED GATEWAYS (PENDING STATE) ---
  const isMoMo = method === 'MOMO';
  const isVNPay = method === 'VNPAY';
  const isZaloPay = method === 'ZALOPAY';
  const isBank = method === 'BANK_TRANSFER';

  // Theme Styles based on Method
  const getThemeConfig = () => {
    const activeConfig = paymentConfigs.find(c => c.gatewayKey === (method || paymentDetails?.method)) || {};
    const baseName = activeConfig.gatewayName || (isMoMo ? 'Ví Điện Tử MoMo' : isVNPay ? 'VNPay' : isZaloPay ? 'Ví ZaloPay' : 'Chuyển khoản Ngân hàng');
    if (isMoMo) {
      return {
        bg: 'bg-pink-600',
        textColor: 'text-pink-600',
        borderColor: 'border-pink-500',
        logoName: `${baseName} (Giả lập)`,
        bannerImg: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
      };
    }
    if (isVNPay) {
      return {
        bg: 'bg-blue-800',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-600',
        logoName: `${baseName} (Giả lập)`,
        bannerImg: 'https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAY.png'
      };
    }
    if (isBank) {
      return {
        bg: 'bg-slate-800',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-700',
        logoName: `${baseName} (Giả lập)`,
        bannerImg: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png'
      };
    }
    // ZaloPay or backup
    return {
      bg: 'bg-cyan-600',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-500',
      logoName: `${baseName} (Giả lập)`,
      bannerImg: 'https://images.careerbuilder.vn/employer_folders/lot1/237243/118833zalopay-03.png'
    };
  };

  const theme = getThemeConfig();

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 sm:p-6 animate-slide-up">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Checkout simulation & QR code */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div className="w-full text-center mb-6">
            <span className={`inline-block px-3 py-1 ${theme.textColor} bg-slate-50 border ${theme.borderColor} text-[9px] font-black uppercase rounded-full tracking-widest`}>
              Cổng thanh toán giả lập trực tuyến
            </span>
            <h3 className="text-lg font-black text-slate-800 mt-2.5">{theme.logoName}</h3>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/60 shadow-inner flex flex-col items-center gap-3">
            <img 
              src={getSimulatedQRCode()} 
              alt="Simulated QR Code" 
              className="w-48 h-48 rounded-xl object-contain border border-slate-200 bg-white"
            />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Quét mã để giả lập thanh toán
              </span>
              <p className="text-[9px] text-slate-500 font-semibold max-w-[200px] mt-1">
                Sử dụng app ngân hàng hoặc camera quét để kiểm tra cú pháp và số tiền.
              </p>
            </div>
          </div>

          <div className="w-full mt-8 text-left">
            <button
              onClick={handleConfirmMockPayment}
              disabled={loading}
              className={`w-full py-4 ${theme.bg} hover:brightness-110 text-white font-black rounded-2xl shadow-xl transition-all cursor-pointer border-none text-xs flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi yêu cầu...
                </>
              ) : (
                <>
                  ✓ Tôi đã hoàn tất chuyển khoản thành công
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center font-medium mt-2 leading-relaxed">
              Bấm nút này để xác nhận bạn đã quét QR hoặc chuyển tiền thủ công với đúng cú pháp. Giao dịch sẽ được chuyển tới hàng chờ phê duyệt của Manager.
            </p>
          </div>
        </div>

        {/* Right Side - Transaction Info */}
        <div className="w-full md:w-96 p-6 sm:p-8 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-black text-slate-800 border-b border-slate-200 pb-3 mb-5">
              Chi Tiết Thanh Toán
            </h4>

            {paymentDetails && (
              <div className="flex flex-col gap-4 font-semibold text-xs text-slate-600">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black">Học Viên</span>
                  <span className="text-slate-800 font-bold">{paymentDetails.studentName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black">Lớp Đào Tạo</span>
                  <span className="text-slate-800 font-bold">{paymentDetails.className}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black">Khóa Học</span>
                  <span className="text-slate-800 font-bold">{paymentDetails.courseTitle}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black">Cú Pháp Chuyển Khoản</span>
                  <span className="text-orange-600 font-black text-sm select-all bg-orange-50 border border-orange-200/50 py-1.5 px-3 rounded-lg flex items-center justify-between">
                    {paymentDetails.transferSyntax}
                    <span className="text-[9px] text-orange-400 font-bold border border-orange-200 px-1.5 py-0.5 rounded bg-white cursor-pointer select-none" onClick={() => {
                      navigator.clipboard.writeText(paymentDetails.transferSyntax);
                      alert('Đã sao chép cú pháp chuyển khoản!');
                    }}>SAO CHÉP</span>
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1 border-t border-slate-200 pt-3">
                  <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black">Tổng Học Phí</span>
                  <span className="text-lg text-orange-600 font-black">{formatVND(paymentDetails.amount)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5 flex flex-col gap-3">
            <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-200/50 p-3 rounded-xl text-left">
              <span className="text-sm">🏦</span>
              {(() => {
                const activeConfig = paymentConfigs.find(c => c.gatewayKey === (method || paymentDetails?.method)) || {};
                const bankName = activeConfig.gatewayName || 'Techcombank';
                const acctNum = activeConfig.accountNumber || '1903456789012';
                const accName = activeConfig.accountName || 'EduEnglish Center';
                return (
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <strong>Thông tin chuyển khoản:</strong> Gửi tới <strong>{bankName}</strong> - STK/SĐT: <code>{acctNum}</code> - Chủ tài khoản: <strong>{accName}</strong> với đúng cú pháp trên.
                  </p>
                );
              })()}
            </div>
            <button
              onClick={onBackToDashboard}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Hủy thanh toán & Quay lại
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default TuitionPaymentPortal;
