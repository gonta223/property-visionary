import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
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

    // TODO: OpenAI APIを使用して画像認識と文字起こしを行う
    // TODO: 抽出した情報を元に新しい物件画像を生成する
    // 仮の実装として、アップロードされた画像をそのまま表示
    setGeneratedImage(uploadedImage);

    toast({
      title: "成功",
      description: "新しい物件画像が生成されました。",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">不動産物件画像生成ツール</h1>
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
      <Button onClick={handleSubmit}>画像生成</Button>
      {generatedImage && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>生成された物件画像</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={generatedImage} alt="Generated" className="max-w-full h-auto" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;