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

  const propertyFields = [
    { key: 'rent', label: '家賃' },
    { key: 'address', label: '住所' },
    { key: 'size', label: '広さ' },
    { key: 'layout', label: '間取り' },
    { key: 'age', label: '築年数' },
    { key: 'nearestStation', label: '最寄り駅' },
    { key: 'floorPlan', label: '間取り図' },
    { key: 'buildingType', label: '建物タイプ' },
    { key: 'constructionDate', label: '建築年月' },
    { key: 'availableDate', label: '入居可能日' },
    { key: 'deposit', label: '敷金' },
    { key: 'keyMoney', label: '礼金' },
    { key: 'managementFee', label: '管理費' },
    { key: 'parkingFee', label: '駐車場料金' },
    { key: 'internetAvailability', label: 'インターネット設備' },
    { key: 'petPolicy', label: 'ペット可否' },
    { key: 'floorLevel', label: '階数' },
    { key: 'totalFloors', label: '総階数' },
    { key: 'orientation', label: '向き' },
    { key: 'balcony', label: 'バルコニー' },
    { key: 'airConditioning', label: 'エアコン' },
    { key: 'securitySystem', label: 'セキュリティ' },
    { key: 'contractType', label: '契約形態' },
    { key: 'renewalFee', label: '更新料' },
    { key: 'guarantorRequirement', label: '保証人要否' },
    { key: 'fireInsurance', label: '火災保険' },
    { key: 'features', label: '特徴・設備' },
    { key: 'surroundingEnvironment', label: '周辺環境' },
  ];

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
                  text: `この不動産物件画像から以下の情報を可能な限り抽出してください：${propertyFields.map(field => field.label).join('、')}。JSONフォーマットで出力してください。情報が不明な場合は、その項目を省略してください。`
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
          max_tokens: 500,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const extractedData = JSON.parse(data.choices[0].message.content);
      setExtractedInfo(extractedData);

      toast({
        title: "成功",
        description: "物件情報が抽出されました。",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "エラー",
        description: "情報の抽出に失敗しました。",
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
                {propertyFields.map(({ key, label }) => (
                  extractedInfo[key] && (
                    <TableRow key={key}>
                      <TableCell>{label}</TableCell>
                      <TableCell>{extractedInfo[key]}</TableCell>
                    </TableRow>
                  )
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
