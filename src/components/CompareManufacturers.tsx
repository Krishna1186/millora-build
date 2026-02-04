
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GitCompare, Star, Award } from "lucide-react";

interface Manufacturer {
  id: string;
  company_name: string;
  full_name: string;
  city: string;
  state: string;
  type_of_manufacturing: string;
  rating: number;
  certificates: string[];
  company_description: string;
}

interface CompareManufacturersProps {
  selectedManufacturers: Manufacturer[];
}

const CompareManufacturers = ({ selectedManufacturers }: CompareManufacturersProps) => {
  const [open, setOpen] = useState(false);

  if (selectedManufacturers.length < 2) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="luxury-button luxury-button-primary shadow-lg hover:shadow-xl"
            size="lg"
          >
            <GitCompare className="w-4 h-4 mr-2" />
            COMPARE ({selectedManufacturers.length})
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Compare Manufacturers</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Criteria</TableHead>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableHead key={manufacturer.id} className="font-medium min-w-[200px]">
                      {manufacturer.company_name || manufacturer.full_name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Location</TableCell>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableCell key={manufacturer.id}>
                      {manufacturer.city && manufacturer.state 
                        ? `${manufacturer.city}, ${manufacturer.state}`
                        : 'Not specified'
                      }
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Manufacturing Types</TableCell>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableCell key={manufacturer.id}>
                      {manufacturer.type_of_manufacturing ? (
                        <div className="flex flex-wrap gap-1">
                          {manufacturer.type_of_manufacturing.split(',').map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Rating</TableCell>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableCell key={manufacturer.id}>
                      {manufacturer.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{manufacturer.rating.toFixed(1)}/5.0</span>
                        </div>
                      ) : (
                        'No rating yet'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Certifications</TableCell>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableCell key={manufacturer.id}>
                      {manufacturer.certificates && manufacturer.certificates.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>{manufacturer.certificates.length} certification{manufacturer.certificates.length !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        'None listed'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Company Description</TableCell>
                  {selectedManufacturers.map((manufacturer) => (
                    <TableCell key={manufacturer.id} className="max-w-xs">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {manufacturer.company_description || 'No description provided'}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button className="luxury-button luxury-button-primary">
              Contact Selected
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompareManufacturers;
