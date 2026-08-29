import { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Tabs, Upload, Grid, Typography, message, Space, Divider, Alert } from "antd";
import { GithubOutlined, InboxOutlined, FolderOutlined, FileOutlined, CheckCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";
import siteService from "../api/siteService";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Dragger } = Upload;

export default function UploadProject () {
   const screens = useBreakpoint()
   const isMobile = !screens.md
   const { isDark } = useTheme()
   const [messageApi, contextHolder] = message.useMessage();

   const [folderFiles, setFolderFiles] = useState([])
   const [loading, setLoading] = useState(false)
   const [result, setResult] = useState(null)
   const [githubForm] = Form.useForm()

   const handleFolderSubmit = async () => {
      if (!folderFiles.length) {
         messageApi.warning('Vui lòng chọn thư mục trước');
         return;
      }
      setLoading(true)
      try {
         const res = await siteService.deployFolder(folderFiles)
         setResult(res.data.data)
         messageApi.success('Deploy thành công');
      } catch (err) {
         messageApi.error(err?.response?.data?.message || 'Deploy thất bại');
      } finally {
         setLoading(false)
      }
   }

   const handleGithubSubmit = async (values) => {
      setLoading(true)
      try {
         const res = await siteService.deployGithub(values.githubUrl)
         setResult(res.data.data)
         messageApi.success('Deploy thành công');
      } catch (err) {
         messageApi.error(err?.response?.data?.message || 'Deploy thất bại');
      } finally {
         setLoading(false)
      }
   }

   const props = {
      name: 'folder',
      multiple: true,
      directory: true,
      beforeUpload: () => false,
      onChange(info) {
         const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
         setFolderFiles(files);
         messageApi.success(`Đã chọn ${files.length} file trong thư mục`);
      },
   };

   const resultCard = result ? (
      <Alert
        type={result.status === 'ACTIVE' ? 'success' : result.status === 'FAILED' ? 'error' : 'info'}
        showIcon
        message={result.status === 'ACTIVE' ? 'Site đã sẵn sàng' : result.status === 'FAILED' ? 'Deploy thất bại' : 'Đang deploy...'}
        description={
          result.status === 'ACTIVE' ? (
            <div>
              <Text>Subdomain: <Text code strong>{result.subdomain}</Text></Text>
              <br />
              <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
            </div>
          ) : result.errorMessage ? (
            <Text type="danger">{result.errorMessage}</Text>
          ) : null
        }
        style={{ marginBottom: 16 }}
      />
   ) : null;

   const githubTab=(
      <Card>
         <Form form={githubForm} layout="vertical" onFinish={handleGithubSubmit}>
            <Form.Item
            name='githubUrl'
               label="Link github"
               rules={[{ required: true, message: 'Vui lòng nhập link' }]}
            >
               <Input
                 placeholder="https://github.com/username/repo"
                 prefix={<GithubOutlined />}
                 maxLength={200}
                 showCount
                 style={isMobile ? {width:'100%'} : {width:"60%"}}
               >
               </Input>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<GithubOutlined />}>Submit</Button>
          </Form>
      </Card>
   )

   const folderTab=(
      <Card>
        {contextHolder}
        <Form layout="vertical">
          <Form.Item name="folder" label="Chọn thư mục">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload.
              </p>
            </Dragger>
          </Form.Item>
          <Button type="primary" onClick={handleFolderSubmit} loading={loading} icon={<FolderOutlined />}>Submit</Button>
        </Form>
      </Card>
   )
   const onChange = key => {
      console.log(key);
   };
   const items = [
   {
    key: '1',
    label: 'Upload foler project',
    children: folderTab,
   },
   {
    key: '2',
    label: 'Upload link github',
    children:  githubTab
   },
   ];

   const guideCard = (
      <Card
        title={<Title level={5} style={{ margin: 0 }}> Cách Deploy</Title>}
        style={{
          borderRadius: 16,
          background: isDark ? '#1f1f1f' : '#fff',
          border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          position: 'sticky',
          top: 24,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong> Yêu cầu file chính</Text>
            <Paragraph style={{ margin: '4px 0 0' }}>
              File chính của website phải đặt tên là{' '}
              <Text code strong style={{ color: '#1677ff' }}>index.html</Text>.
              Hệ thống sẽ dùng nó làm trang mở đầu.
            </Paragraph>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text strong><FolderOutlined /> Cấu trúc thư mục</Text>
            <div style={{
              background: isDark ? '#141414' : '#f6f8fa',
              borderRadius: 8,
              padding: '12px 16px',
              marginTop: 8,
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.9,
            }}>
              <div><FolderOutlined style={{ color: '#faad14' }} /> my-website/</div>
              <div style={{ paddingLeft: 20 }}><FileOutlined /> <Text code>index.html</Text> <Text style={{ color: '#8c8c8c' }}>&lt;— bắt buộc</Text></div>
              <div style={{ paddingLeft: 20 }}><FileOutlined /> style.css</div>
              <div style={{ paddingLeft: 20 }}><FileOutlined /> app.js</div>
              <div style={{ paddingLeft: 20 }}><FolderOutlined style={{ color: '#faad14' }} /> assets/</div>
              <div style={{ paddingLeft: 40 }}><FileOutlined /> logo.png</div>
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text strong><LinkOutlined /> Cách 2: GitHub</Text>
            <Paragraph style={{ margin: '4px 0 0' }}>
              Dán link repo GitHub chứa code tĩnh. Repo cũng phải có file <Text code>index.html</Text> ở thư mục gốc.
            </Paragraph>
          </div>
        </Space>
      </Card>
   )

   return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={14}>
         {resultCard}
         <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Col>
      <Col xs={24} md={10}>
         {guideCard}
      </Col>
    </Row>
   );
}
