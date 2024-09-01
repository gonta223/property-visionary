import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PropertyListing = ({ propertyInfo }) => {
  if (!propertyInfo) return null;

  const mainInfo = ['家賃', '管理費', '敷金', '礼金', '住所', '最寄駅', '駅からの距離', '間取り'];
  const detailInfo = Object.keys(propertyInfo).filter(key => !mainInfo.includes(key));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">物件情報</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {mainInfo.map((key) => (
          <div key={key} className="border-b pb-2">
            <span className="font-semibold">{key}:</span> {propertyInfo[key] || '情報なし'}
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>詳細情報</CardTitle>
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
              {detailInfo.map((key) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>{propertyInfo[key] || '情報なし'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyListing;