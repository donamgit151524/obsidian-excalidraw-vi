# Kiểm tra bản 2.29.0-vi.1

Nguồn nền: tag `2.29.0`, commit `4acaf9e375e1dfb731faec9c2dd3439bd52cc4cb`. Bản fork được ghim về cây nguồn của tag này trước khi áp dụng các thay đổi Việt/Anh, thay vì sử dụng các tính năng chưa phát hành trên nhánh master upstream.

- Build production bằng Rollup: thành công. `node --check dist/main.js`: thành công.
- Kiểm tra từ điển: đủ 1.398 khóa plugin và 644 khóa bảng vẽ; không thiếu khóa Việt/Anh; biến mẫu và ví dụ `<code>` giữ đúng. Bộ nạp locale nén chuyển Việt → Anh → Việt và xử lý giá trị ngôn ngữ không hợp lệ đúng.
- Đã thử trong cửa sổ cài đặt tách rời của Obsidian 1.14.5 trên Windows: mục ngôn ngữ hiển thị hai lựa chọn; chuyển sang English làm giao diện cài đặt chuyển sang tiếng Anh, chọn Tiếng Việt đưa giao diện về tiếng Việt. Thiết lập được lưu thành `uiLanguage` trong cấu hình plugin.
- Từ điển tiếng Việt đầy đủ được ghép thành công vào cả payload development và production của dependency Excalidraw `0.18.143`, không sửa trực tiếp tệp trong `node_modules`.
- Lint toàn kho gốc có 120 lỗi. So sánh theo tệp, rule và thông báo cho thấy không có chẩn đoán mới sau khi loại bỏ ký tự khoảng trắng lạ của bản dịch. Lint riêng `src/lang/locale/vi.ts` sạch. Xem `lint-comparison.json`.
- `tsc --noEmit` không báo lỗi trong `src/`, nhưng không hoàn toàn xanh do 21 lỗi khai báo có sẵn trong tài liệu API và dependency upstream.

Các bước UI được thử bằng kỹ năng Computer Use. CLI Obsidian trên máy không kết nối được với phiên đang chạy. Chưa thử trên điện thoại thật hoặc macOS/Linux; chưa xác nhận mọi trạng thái của trình biên tập bằng UI. Tài liệu và lịch sử phát hành upstream, nội dung người dùng và tập lệnh cộng đồng nằm ngoài bộ giao diện dịch.

Các tệp bản cài không chứa ghi chú, `data.json`, khóa API hoặc cấu hình riêng của vault. Bản sao ba tệp cài gốc được giữ cục bộ ngoài Git trong `local-backup/`.

