# QRCode Login
1.	Web client gửi yêu cầu tạo QRCode lên server. Server trả về qrcode để hiển thị và một cái code để định danh trình duyệt. 
2.	Web client hiển thị QR và gửi một API để chờ thông tin phản hồi của server với tham số là code vừa nhận được ở bước trước. Server không respond lại API này ngay mà chờ trong khoảng 1 phút (1 phút này có thể tùy chỉnh theo thời gian TTL của QR, nhưng không lớn quá được do tùy trình duyệt mà nó cho phép timeout khác nhau, nói chung 1 phút là ổn rồi). 
3.	Mobile client quét QR và gửi 1 api lên server. Server check QR. 
+ Nếu QR đúng: server respond lại API web request lên từ bước 2 rằng là đăng nhập thành công vs tài khoản xyz, set session. + Nếu QR sai: báo sai về client. 
4.	Hết 1 phút mà mobile client không quét qr code, server respond lại API đã gửi từ bước 2 là timeout, mời bạn ấn nút để tạo lại qr code. 
