import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";
import { useDropzone } from 'react-dropzone';
import { Input } from "../components/ui/input";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from "../components/ui/button";
import { FileDown } from 'lucide-react';

const PropertyListing = React.forwardRef(({ propertyInfo: initialPropertyInfo, matchRates, language, apiKey }, ref) => {
  const [propertyInfo, setPropertyInfo] = useState(initialPropertyInfo || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEn, setIsEditingEn] = useState(false);
  const [isEditingZh, setIsEditingZh] = useState(false);
  const [translatedInfo, setTranslatedInfo] = useState(null);
  const [customImages, setCustomImages] = useState([null, null]);
  const componentRef = useRef(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [showTranslations, setShowTranslations] = useState(false);

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

  const { getRootProps: getRootProps0, getInputProps: getInputProps0 } = useDropzone({
    onDrop: (files) => onDrop(files, 0),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
    onDrop: (files) => onDrop(files, 1),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

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

  const formatValue = (value) => {
    if (value === null || value === undefined) return '情報なし';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return Object.values(value).join(', ');
    }
    return String(value);
  };

  const managementFee = formatFee(propertyInfo['管理費'], '管理費') || formatFee(propertyInfo['共益費'], '共益費') || '情報なし';

  // 特徴や魅力なポイントを配列に変換
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
          value={formatValue(value) || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="text-xs w-full h-8"
        />
      );
    }
    return <p className="text-gray-700">{formatValue(value || '情報なし')}</p>;
  };

  // 一致率に基づく文字色のクラスを決定
  const getTextColorClass = (rate) => {
    if (!rate) return 'text-blue-800';
    if (rate === 100) return 'text-green-700';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 一致率に基づく背景色のクラスを決定
  const getBgColorClass = (rate) => {
    if (!rate) return 'bg-blue-50';
    if (rate === 100) return 'bg-green-50';
    if (rate >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // 一致率に基づくボーダー色のクラスを決定
  const getBorderColorClass = (rate) => {
    if (!rate) return 'border-blue-200';
    if (rate === 100) return 'border-green-200';
    if (rate >= 70) return 'border-yellow-200';
    return 'border-red-200';
  };

  // 情報アイテムをレンダリングする補助関数を修正
  const renderInfoItem = (key, value, rate) => (
    <div 
      key={key} 
      className={`p-1.5 rounded border ${getBgColorClass(rate)} ${getBorderColorClass(rate)}`}
    >
      <p className={`font-semibold ${getTextColorClass(rate)} flex justify-between items-center text-[10px]`}>
        {key}
        {rate && (
          <span className="opacity-75">
            {rate.toFixed(0)}%
          </span>
        )}
      </p>
      {renderEditableText(key, value)}
    </div>
  );

  const handleSavePDF = async () => {
    if (!containerRef.current) return;

    try {
      const element = containerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${propertyInfo['物件名称'] || '物件情報'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF生成エラー:', error);
    }
  };

  // フォントサイズを自動調する数
  const adjustFontSize = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    
    // コンテナの固定サイズを設定（16:9の縦横比）
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * (9/16); // 16:9の縦横比
    container.style.height = `${containerHeight}px`;

    // 初期フォントサイズ
    let fontSize = 16;
    content.style.fontSize = `${fontSize}px`;

    // コンテンツがコンテナに収まるまでフォントサイズを調整
    while (content.scrollHeight > containerHeight && fontSize > 8) {
      fontSize -= 0.5;
      content.style.fontSize = `${fontSize}px`;
    }

    // 他の要素のフォントサイズも比例して調整
    const ratio = fontSize / 16;
    const headings = content.querySelectorAll('h2');
    headings.forEach(h => {
      h.style.fontSize = `${24 * ratio}px`;
    });
  }, [propertyInfo]);

  // レイアウト変更時にフォントサイズを調整
  useLayoutEffect(() => {
    adjustFontSize();
    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [adjustFontSize]);

  const handleTranslate = async () => {
    if (!apiKey) {
      console.error('APIキーが設定されていません');
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
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `
                以下の不動産物件情報を英語と中国語に訳してください。
                翻訳結果はJSONフォーマットで、以下の構造で出力してください：
                {
                  "en": {
                    // 英語翻訳
                    "物件名称": "Property Name",
                    "家賃": "Rent",
                    ...
                  },
                  "zh": {
                    // 中国語翻訳
                    "物件名称": "物业名称",
                    "家賃": "租金",
                    ...
                  }
                }
                
                翻訳対象の物件情報：
                ${JSON.stringify(propertyInfo, null, 2)}
                
                注意事項：
                1. 金額や数値は変換せず、単位のみ翻訳してください
                2. 住所は適切に翻訳し、地名はローマ字も残してください
                3. 専門用語は不動産業界で一般的に使用される表現を使用してください
                4. 情報なしの項目は英語では"No information"、中国語では"暂无信息"と翻訳してください
                5. 数値範囲の区切り「〜」は英語では"to"、中国語では"至"に変換してください
              `
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('Translation API request failed');
      }

      const data = await response.json();
      const translations = JSON.parse(data.choices[0].message.content);

      // 翻訳結果を保存して表示状態を更新
      setTranslatedInfo(translations);
      setShowTranslations(true);

    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // 各言語バージョンの編集状態を切り替える関数
  const handleEditTranslation = (language) => {
    if (language === 'en') {
      setIsEditingEn(!isEditingEn);
    } else if (language === 'zh') {
      setIsEditingZh(!isEditingZh);
    }
  };

  // 翻訳テキストの編集用関数
  const handleTranslatedInputChange = (language, key, value) => {
    setTranslatedInfo(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        [key]: value
      }
    }));
  };

  // 編集可能なテキストを表示する関数（翻訳バージョン用）
  const renderEditableTranslatedText = (language, key, value) => {
    const isEditingThis = language === 'en' ? isEditingEn : isEditingZh;
    
    if (isEditingThis) {
      return (
        <Input
          value={formatValue(value) || ''}
          onChange={(e) => handleTranslatedInputChange(language, key, e.target.value)}
          className="text-xs w-full h-8"
        />
      );
    }
    return <p className="text-gray-700">{formatValue(value || '情報なし')}</p>;
  };

  // 翻訳テンプレートに全ての項目と正しいキーを追加
  const translationTemplates = {
    en: {
      "物件名称": "Property Name",
      "家賃": "Rent",
      "管理費": "Management Fee",
      "共益費": "Common Service Fee",
      "敷金": "Security Deposit",
      "礼金": "Key Money",
      "住所": "Address",
      "最寄駅": "Nearest Station",
      "駅からの距離": "Distance from Station",
      "建物種別": "Building Type",
      "構造": "Structure",
      "階数": "Number of Floors",
      "築年数": "Building Age",
      "リフォーム年": "Renovation Year",
      "向き": "Direction",
      "専有面積": "Floor Area",
      "間取り": "Layout",
      "バルコニー面積": "Balcony Area",
      "設備（キッチン）": "Facilities (Kitchen)",
      "設備（バス・トイレ）": "Facilities (Bath/Toilet)",
      "設備（収納）": "Facilities (Storage)",
      "設備（冷暖房）": "Facilities (AC/Heating)",
      "設備（セキュリティ）": "Facilities (Security)",
      "駐車場": "Parking",
      "バイク置���場": "Motorcycle Parking",
      "自転車置き場": "Bicycle Parking",
      "ペット可否": "Pet Policy",
      "契約期間": "Contract Period",
      "現況": "Current Status",
      "引渡し時期": "Available From",
      "取引形態": "Transaction Type",
      "備考": "Notes",
      "インターネット": "Internet",
      "鍵交換費": "Key Exchange Fee",
      "火災保険": "Fire Insurance",
      "保証会社": "Guarantee Company",
      "保証料": "Guarantee Fee",
      "更新料": "Renewal Fee",
      "仲介手数料": "Brokerage Fee",
      "その他初期費用": "Other Initial Costs"
    },
    zh: {
      "物件名称": "物业名称",
      "家賃": "租金",
      "管理費": "管理费",
      "共益費": "共益费",
      "敷金": "押金",
      "礼金": "礼金",
      "住所": "地址",
      "最寄駅": "最近车站",
      "駅からの距離": "距离车站",
      "建物種別": "建筑类型",
      "構造": "建筑结构",
      "階数": "楼层数",
      "築年数": "房龄",
      "リフォーム年": "装修年份",
      "向き": "朝向",
      "専有面積": "使用面积",
      "間取り": "户型",
      "バルコニー面積": "阳台面积",
      "設備（キッチン）": "设施（厨房）",
      "設備（バス・トイレ）": "设施（浴室/卫生间）",
      "設備（収納）": "设施（储物）",
      "設備（冷暖房）": "设施（空调/暖气）",
      "設備（セキュリティ）": "设施（安保）",
      "駐車場": "停车场",
      "バイク置き場": "摩托车停车场",
      "自転車置き場": "自行车停车场",
      "ペット可否": "宠物政策",
      "契約期間": "合同期限",
      "現況": "现状",
      "引渡し時期": "交付时间",
      "取引形態": "交易形式",
      "備考": "备注",
      "インターネット": "网络",
      "鍵交換費": "钥匙更换费",
      "火災保険": "火灾保险",
      "保証会社": "担保公司",
      "保証料": "担保费",
      "更新料": "更新费",
      "仲介手数料": "中介费",
      "その他初期費用": "其他初期费用"
    }
  };

  // TranslationResults コンポーネントの修正
  const TranslationResults = () => {
    if (!translatedInfo || !showTranslations) return null;

    const renderTranslatedVersion = (language) => {
      const langInfo = translatedInfo[language];
      if (!langInfo) return null;
      const isEditingThis = language === 'en' ? isEditingEn : isEditingZh;

      return (
        <motion.div 
          className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto mt-8 overflow-hidden relative"
          style={{ width: '100%', aspectRatio: '16/9' }}
        >
          <div className="h-full flex flex-col">
            <div className={`bg-${language === 'en' ? 'blue' : 'red'}-800 text-white p-4 flex justify-between items-center shrink-0`}>
              <h2 className="text-2xl font-bold">
                {language === 'en' ? 'English Version' : '中文版本'}
              </h2>
              <button
                onClick={() => handleEditTranslation(language)}
                className="px-3 py-1 bg-opacity-20 hover:bg-opacity-30 bg-white rounded text-sm"
              >
                {isEditingThis ? '保存' : '編集'}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <div className={`text-xl font-bold ${getTextColorClass(matchRates?.['家賃'])}`}>
                      {translationTemplates[language]['家賃']} {langInfo['家賃']}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className={`font-bold text-sm mb-1 ${getTextColorClass(matchRates?.['住所'])}`}>
                      {translationTemplates[language]['住所']}
                    </p>
                    <div className={getTextColorClass(matchRates?.['住所'])}>
                      {langInfo['住所']}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className={`font-bold text-sm mb-1 ${getTextColorClass(matchRates?.['最寄駅'])}`}>
                      {translationTemplates[language]['最寄駅']}
                    </p>
                    <p className={`text-sm ${getTextColorClass(matchRates?.['最寄駅'])}`}>
                      {langInfo['最寄駅']} {langInfo['駅からの距離']}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <div
                      {...getRootProps0()}
                      className="border-2 border-dashed rounded p-2 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <input {...getInputProps0()} />
                      {customImages[0] ? (
                        <img src={customImages[0]} alt="Property 1" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-gray-500">
                          {language === 'en' ? 'Drop Image 1' : '上传图片1'}
                        </div>
                      )}
                    </div>
                    <div
                      {...getRootProps1()}
                      className="border-2 border-dashed rounded p-2 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <input {...getInputProps1()} />
                      {customImages[1] ? (
                        <img src={customImages[1]} alt="Property 2" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-gray-500">
                          {language === 'en' ? 'Drop Image 2' : '上传图片2'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="grid grid-cols-2 gap-1 text-xs h-full">
                    {allInfo.slice(0, Math.floor(allInfo.length / 2)).map((key) => {
                      if (langInfo[key]) {
                        const rate = matchRates?.[key];
                        return (
                          <div key={key} className={`p-1.5 rounded border ${getBgColorClass(rate)} ${getBorderColorClass(rate)}`}>
                            <p className={`font-semibold ${getTextColorClass(rate)} flex justify-between items-center text-[10px]`}>
                              {translationTemplates[language][key]}
                              <span className="opacity-75">
                                {rate?.toFixed(0)}%
                              </span>
                            </p>
                            {renderEditableTranslatedText(language, key, langInfo[key])}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="grid grid-cols-2 gap-1 text-xs h-full">
                    {allInfo.slice(Math.floor(allInfo.length / 2)).map((key) => {
                      if (langInfo[key]) {
                        const rate = matchRates?.[key];
                        return (
                          <div key={key} className={`p-1.5 rounded border ${getBgColorClass(rate)} ${getBorderColorClass(rate)}`}>
                            <p className={`font-semibold ${getTextColorClass(rate)} flex justify-between items-center text-[10px]`}>
                              {translationTemplates[language][key]}
                              <span className="opacity-75">
                                {rate?.toFixed(0)}%
                              </span>
                            </p>
                            {renderEditableTranslatedText(language, key, langInfo[key])}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    };

    // 修正: 直接JSXを返す
    return (
      <div className="mt-8">
        {renderTranslatedVersion('en')}
        {renderTranslatedVersion('zh')}
      </div>
    );
  };

  return (
    <>
      <motion.div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto mt-8 overflow-hidden relative"
        style={{ width: '100%', aspectRatio: '16/9' }}
      >
        <div ref={contentRef} className="h-full flex flex-col">
          <div className="bg-blue-800 text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {formatValue(propertyInfo['物件名称']) || '物件名称不明'}
              </h2>
              {isEditing && (
                <Input
                  value={formatValue(propertyInfo['物件名称']) || ''}
                  onChange={(e) => handleInputChange('物件名称', e.target.value)}
                  className="text-sm bg-white text-black mt-1 w-full h-8"
                />
              )}
            </div>
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-sm"
            >
              {isEditing ? '保存' : '編集'}
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className={`text-xl font-bold ${getTextColorClass(matchRates?.['家賃'])}`}>
                    家賃 {formatValue(propertyInfo['家賃'])}
                    <span className={`text-xs font-normal ml-1 ${getTextColorClass(matchRates?.['管理費'] || matchRates?.['共益費'])}`}>
                      （{managementFee}）
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <p className={`font-bold text-sm mb-1 ${getTextColorClass(matchRates?.['住所'])}`}>
                    住所
                  </p>
                  <div className={getTextColorClass(matchRates?.['住所'])}>
                    {renderEditableText('住所', propertyInfo['住所'])}
                  </div>
                </div>
                <div className="mb-2">
                  <p className={`font-bold text-sm mb-1 ${getTextColorClass(matchRates?.['最寄駅'])}`}>
                    アクセス
                  </p>
                  <p className={`text-sm ${getTextColorClass(matchRates?.['最寄駅'])}`}>
                    {formatValue(propertyInfo['最寄駅'])} {formatValue(propertyInfo['駅からの距離'])}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <div
                    {...getRootProps0()}
                    className="border-2 border-dashed rounded p-2 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <input {...getInputProps0()} />
                    {customImages[0] ? (
                      <img src={customImages[0]} alt="Property 1" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-500">
                        画像1をドロップ
                      </div>
                    )}
                  </div>
                  <div
                    {...getRootProps1()}
                    className="border-2 border-dashed rounded p-2 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <input {...getInputProps1()} />
                    {customImages[1] ? (
                      <img src={customImages[1]} alt="Property 2" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-500">
                        画像2をドロップ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="grid grid-cols-2 gap-1 text-xs h-full">
                  {allInfo.slice(0, Math.floor(allInfo.length / 2)).map((key) => {
                    if (propertyInfo[key] && propertyInfo[key] !== '情報なし') {
                      const rate = matchRates?.[key];
                      return renderInfoItem(key, propertyInfo[key], rate);
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="grid grid-cols-2 gap-1 text-xs h-full">
                  {allInfo.slice(Math.floor(allInfo.length / 2)).map((key) => {
                    if (propertyInfo[key] && propertyInfo[key] !== '情報なし') {
                      const rate = matchRates?.[key];
                      return renderInfoItem(key, propertyInfo[key], rate);
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <Button
            onClick={handleTranslate}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2"
          >
            翻訳
          </Button>
          <Button
            onClick={handleSavePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2"
          >
            <FileDown className="w-4 h-4" />
            PDF保存
          </Button>
        </div>
      </motion.div>
      <TranslationResults />
    </>
  );
});

export default PropertyListing;
