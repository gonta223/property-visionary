import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";
import { useDropzone } from 'react-dropzone';
import { Input } from "../components/ui/input";

const PropertyListing = React.forwardRef(({ propertyInfo: initialPropertyInfo, language }, ref) => {
  const [propertyInfo, setPropertyInfo] = useState(initialPropertyInfo || {});
  const [isEditing, setIsEditing] = useState(false);
  const [customImages, setCustomImages] = useState([null, null]);

  const onDrop = useCallback((acceptedFiles, index) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImages(prev => {
        const newImages = [...prev];
        newImages[index] = e.target.result;
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getRootProps0, getInputProps: getInputProps0 } = useDropzone({ onDrop: (files) => onDrop(files, 0) });
  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({ onDrop: (files) => onDrop(files, 1) });

  const allInfo = [
    '家賃', '管理費', '共益費', '敷金', '礼金', '住所', '最寄駅', '駅からの距離', '建物種別', '構造',
    '階数', '築年数', 'リフォーム年', '向き', '専有面積', '間取り', 'バルコニー面積',
    '設備（キッチン）', '設備（バス・トイレ）', '設備（収納）', '設備（冷暖房）', '設備（セキュリティ）',
    '駐車場', 'バイク置き場', '自転車置き場', 'ペット可否', '契約期間', '現況', '引渡し時期',
    '取引形態', '備考', 'インターネット', '鍵交換費', '火災保険', '保証会社', '保証料', '更新料', 
    '仲介手数料', 'その他初期費用'
  ];

  const formatFee = (fee, type) => {
    if (fee && fee !== '情報なし') {
      return `${type} ${fee}`;
    }
    return null;
  };

  const managementFee = formatFee(propertyInfo['管理費'], '管理費') || formatFee(propertyInfo['共益費'], '共益費') || '情報なし';

  // 特徴や魅力的なポイントを配列に変換
  const features = Array.isArray(propertyInfo['特徴や魅力的なポイント'])
    ? propertyInfo['特徴や魅力的なポイント']
    : typeof propertyInfo['特徴や魅力的なポイント'] === 'object' && propertyInfo['特徴や魅力的なポイント'] !== null
    ? Object.values(propertyInfo['特徴や魅力的なポイント'])
    : propertyInfo['特徴や魅力的なポイント']
      ? [propertyInfo['特徴や魅力的なポイント']]
      : ['情報なし'];

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (key, value) => {
    setPropertyInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderEditableText = (key, value) => {
    if (isEditing) {
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="text-xs w-full"
        />
      );
    }
    return <p className="text-gray-700">{String(value || '情報なし')}</p>;
  };

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto mt-8 overflow-hidden"
      style={{ aspectRatio: '16/9', width: '100%' }}
    >
      <div className="bg-blue-800 text-white p-2 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">賃貸{propertyInfo['建物種別'] || '物件'}</h2>
          {isEditing ? (
            <Input
              value={propertyInfo['物件名称'] || ''}
              onChange={(e) => handleInputChange('物件名称', e.target.value)}
              className="text-sm bg-white text-black mt-1"
            />
          ) : (
            <h3 className="text-lg">{propertyInfo['物件名称'] || '物件名称不明'}</h3>
          )}
        </div>
        <button
          onClick={handleEdit}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-sm"
        >
          {isEditing ? '保存' : '編集'}
        </button>
      </div>
      <div className="p-4 h-[calc(100%-3rem)] overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold text-blue-600">
                家賃 {isEditing ? (
                  <Input
                    value={propertyInfo['家賃'] || ''}
                    onChange={(e) => handleInputChange('家賃', e.target.value)}
                    className="inline-block w-40"
                  />
                ) : (
                  propertyInfo['家賃'] || '情報なし'
                )}
                <span className="text-xs font-normal ml-1 text-gray-600">
                  （{managementFee}）
                </span>
              </div>
              {propertyInfo['礼金'] === '0円' || propertyInfo['礼金'] === '0ヶ月' ? (
                <Badge variant="secondary" className="text-sm bg-green-500 text-white">
                  礼金0円！
                </Badge>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2" style={{ height: '100%' }}>
              {[getRootProps0, getRootProps1].map((getRootProps, index) => (
                <div key={index} {...getRootProps()} className="relative cursor-pointer w-full h-full">
                  <input {...(index === 0 ? getInputProps0() : getInputProps1())} />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    {customImages[index] ? (
                      <div className="w-full h-full relative">
                        <img
                          src={customImages[index]}
                          alt={`物件画像 ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <p className="text-gray-500 text-xs mt-2">画像をドロップまたはクリック</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <p className="font-bold text-sm mb-1 text-blue-800">
                {language === '英語' ? 'Address' : language === '中国語' ? '地址' : '住所'}
              </p>
              {renderEditableText('住所', propertyInfo['住所'])}
            </div>
            <div className="mb-2">
              <p className="font-bold text-sm mb-1 text-blue-800">アクセス</p>
              {isEditing ? (
                <div className="space-y-1">
                  <Input
                    value={propertyInfo['最寄駅'] || ''}
                    onChange={(e) => handleInputChange('最寄駅', e.target.value)}
                    className="text-xs"
                    placeholder="最寄駅"
                  />
                  <Input
                    value={propertyInfo['駅からの距離'] || ''}
                    onChange={(e) => handleInputChange('駅からの距離', e.target.value)}
                    className="text-xs"
                    placeholder="駅からの距離"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-700">
                  {propertyInfo['最寄駅']} {propertyInfo['駅からの距離'] || '情報なし'}
                </p>
              )}
            </div>
            <div>
              <p className="font-bold text-sm mb-1 text-blue-800">物件の特徴</p>
              <ul className="list-disc list-inside text-xs text-gray-700">
                {isEditing ? (
                  features.map((point, index) => (
                    <li key={index} className="mb-1">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newFeatures = [...features];
                          newFeatures[index] = e.target.value;
                          handleInputChange('特徴や魅力的なポイント', newFeatures);
                        }}
                        className="text-xs w-full inline-block"
                      />
                    </li>
                  ))
                ) : (
                  features.map((point, index) => (
                    <li key={index}>{String(point)}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
          
          <div className="md:col-span-5">
            <Card className="h-full overflow-auto shadow-lg">
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {allInfo.map((key) => {
                    if (propertyInfo[key] && propertyInfo[key] !== '情報なし') {
                      return (
                        <div key={key} className="mb-1">
                          <p className="font-semibold text-blue-600">{key}</p>
                          {renderEditableText(key, propertyInfo[key])}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs">
          <h4 className="font-bold mb-1 text-blue-800">取扱不動産会社情報</h4>
          {['取扱不動産会社', '電話番号', '不動産会社住所', '免許番号'].map((key) => {
            if (propertyInfo[key] && propertyInfo[key] !== '情報なし') {
              return (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}:</span>
                  {renderEditableText(key, propertyInfo[key])}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default PropertyListing;
