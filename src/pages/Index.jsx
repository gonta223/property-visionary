import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import PropertyListing from '../components/PropertyListing';
import { usePDF } from 'react-to-pdf';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [rawApiOutput, setRawApiOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { toPDF, targetRef } = usePDF({filename: 'property-listing.pdf'});

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

    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "この不動産物件画像から以下の項目の情報を可能な限り詳細に抽出してください。情報が見つからない場合は「情報なし」と記入してください：1.物件名称、2.家賃、3.管理費、4.共益費、5.敷金、6.礼金、7.住所、8.最寄駅、9.駅からの距離、10.建物種別、11.構造、12.階数、13.築年数、14.リフォーム年、15.向き、16.専有面積、17.間取り、18.バルコニー面積、19.設備（キッチン）、20.設備（バス・トイレ）、21.設備（収納）、22.設備（冷暖房）、23.設備（セキュリティ）、24.駐車場、25.バイク置き場、26.自転車置き場、27.ペット可否、28.契約期間、29.現況、30.引渡し時期、31.取引形態、32.備考、33.取扱不動産会社、34.電話番号、35.不動産会社住所、36.免許番号、37.外観画像URL、38.内装画像1URL、39.間取り図URL、40.特徴や魅力的なポイント（3つ以上）。JSONフォーマットで出力してください。画像に含まれていない情報は「情報なし」としてください。"
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
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setRawApiOutput(JSON.stringify(data, null, 2));

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Unexpected response structure from API');
      }

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
        description: `情報の抽出に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "処理中..." : "情報抽出"}
      </Button>
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">物件情報を抽出中です。しばらくお待ちください...</p>
        </div>
      )}
      {rawApiOutput && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>API出力（生データ）</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              {rawApiOutput}
            </pre>
          </CardContent>
        </Card>
      )}
      {extractedInfo && (
        <>
          <PropertyListing ref={targetRef} propertyInfo={extractedInfo} />
          <Button onClick={() => toPDF()} className="mt-4">PDFとして保存</Button>
        </>
      )}
    </div>
  );
};

export default Index;