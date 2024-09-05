import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import PropertyListing from '../components/PropertyListing';
import { usePDF } from 'react-to-pdf';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { toPDF, targetRef } = usePDF({filename: 'property-listing.pdf'});
  const [rawData, setRawData] = React.useState(null);
  const [language, setLanguage] = useState('日本語'); // デフォルトは日本語

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
                  text: "この不動産物件画像から以下の項目の情報を可能な限り詳細に抽出してください。情報が見つからない場合は「情報なし」と記入してください：1.物件名称、2.家賃、3.管理費、4.共益費、5.敷金、6.礼金、7.住所、8.最寄駅、9.駅からの距離、10.建物種別、11.構造、12.階数、13.築年数、14.リフォーム年、15.向き、16.専有面積、17.間取り、18.バルコニー面積、19.設備（キッチン）、20.設備（バス・トイレ）、21.設備（収納）、22.設備（冷暖房）、23.設備（セキュリティ）、24.駐車場、25.バイク置き場、26.自転車置き場、27.ペット可否、28.契約期間、29.現況、30.引渡し時期、31.取引形態、32.備考、33.取扱不動産会社、34.電話番号、35.不動産会社住所、36.免許番号、37.外観画像URL、38.内装画像1URL、39.間取り図URL、40.特徴や魅力的なポイント（3つ以上）、41.鍵交換費、42.火災保険、43.保証会社、44.保証料、45.更新料、46.仲介手数料、47.インターネット、48.その他初期費用。JSONフォーマットで出力してください。画像に含まれていない情報は「情報なし」としてください。"
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
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setRawData(JSON.stringify(data, null, 2)); 

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Unexpected response structure from API');
      }

      const extractedData = JSON.parse(data.choices[0].message.content);
      
      // プロパティ名から番号を削除
      const cleanedData = Object.fromEntries(
        Object.entries(extractedData).map(([key, value]) => [key.replace(/^\d+\./, ''), value])
      );
      
      setExtractedInfo(cleanedData);

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

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);

    // 翻訳が必要な場合、ここでGPT APIを呼び出す
    if (extractedInfo) {
      // TODO: GPT APIを使ってextractedInfoを翻訳する
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 bg-gradient-to-b from-blue-50 to-white min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">不動産物件情報抽出ツール</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-blue-600">OpenAI APIキー</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">APIキー</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="mt-1"
            />
          </CardContent>
        </Card>
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-blue-600">画像アップロード</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
            {uploadedImage && (
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={uploadedImage} 
                alt="Uploaded" 
                className="mt-4 max-w-full h-auto rounded-lg shadow-md" 
              />
            )}
          </CardContent>
        </Card>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isLoading ? "処理中..." : "情報抽出"}
        </Button>
      </motion.div>
      <Tabs defaultValue="日本語" className="mt-6" onValueChange={handleLanguageChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="日本語">日本語</TabsTrigger>
          <TabsTrigger value="英語">英語</TabsTrigger>
          <TabsTrigger value="中国語">中国語</TabsTrigger>
        </TabsList>
      </Tabs>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-blue-600 font-medium">物件情報を抽出中です。しばらくお待ちください...</p>
        </motion.div>
      )}
      {extractedInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PropertyListing ref={targetRef} propertyInfo={extractedInfo} language={language} />
          <Button onClick={() => toPDF()} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            PDFとして保存
          </Button>
        </motion.div>
      )}
      {rawData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <pre className="p-4 bg-gray-100 rounded-lg mt-4 overflow-auto max-h-96 text-sm">
            <code>{rawData}</code>
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Index;