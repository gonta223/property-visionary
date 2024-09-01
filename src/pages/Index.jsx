import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const { toast } = useToast();

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      toast({
        title: "エラー",
        description: "APIキーを入力してください。",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedImage) {
      toast({
        title: "エラー",
        description: "画像をアップロードしてください。",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "この不動産物件画像から以下の情報を抽出してください：家賃、住所、広さ、間取り、築年数、最寄り駅、間取り図、建物タイプ、建築年月、入居可能日、敷金、礼金、管理費、駐車場料金、インターネット設備、ペット可否、階数、総階数、向き、バルコニー、エアコン、セキュリティシステム、エレベーター、駐輪場、契約形態、更新料、保証人要否、火災保険要否、物件の特徴、周辺環境。JSONフォーマットで出力してください。"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: uploadedImage
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const extractedData = JSON.parse(data.choices[0].message.content);
      setExtractedInfo(extractedData);

      toast({
        title: "成功",
        description: "物件情報が抽出されました。",
      });
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "情報の抽出に失敗しました。";
      if (error.message.includes('401')) {
        errorMessage = "APIキーが無効です。正しいAPIキーを入力してください。";
      } else if (error.message.includes('404')) {
        errorMessage = "APIエンドポイントが見つかりません。ネットワーク接続を確認してください。";
      } else if (error.message.includes('429')) {
        errorMessage = "APIリクエストの制限に達しました。しばらく待ってから再試行してください。";
      }
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">不動産物件情報抽出ツール</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>OpenAI APIキー</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="api-key">APIキー</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="sk-..."
          />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>画像アップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploadedImage && (
            <img src={uploadedImage} alt="Uploaded" className="mt-4 max-w-full h-auto" />
          )}
        </CardContent>
      </Card>
      <Button onClick={handleSubmit}>情報抽出</Button>
      {extractedInfo && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>抽出された物件情報</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>項目</TableHead>
                  <TableHead>情報</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(extractedInfo).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value || '情報なし'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;