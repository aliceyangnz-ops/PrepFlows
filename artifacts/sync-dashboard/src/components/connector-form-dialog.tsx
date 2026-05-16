import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateConnector, useUpdateConnector, useListConnectorSources, getListConnectorsQueryKey, getGetConnectorQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  source: z.string().min(1, "Source is required"),
  apiEndpoint: z.string().optional(),
  apiKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  schedule: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateConnectorDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createConnector = useCreateConnector();
  const { data: sourcesData } = useListConnectorSources();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      source: "",
      apiEndpoint: "",
      apiKey: "",
      webhookSecret: "",
      schedule: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createConnector.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Connector created successfully" });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListConnectorsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to create connector", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-connector">
          <Plus className="mr-2 h-4 w-4" />
          Add Connector
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Connector</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Main Kitchen Delphi" {...field} data-testid="input-connector-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-connector-source">
                        <SelectValue placeholder="Select a PMS source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourcesData?.sources?.map((s) => (
                        <SelectItem key={s.source} value={s.source}>{s.displayName}</SelectItem>
                      )) || (
                        <>
                          <SelectItem value="moments">Moments</SelectItem>
                          <SelectItem value="delphi">Delphi</SelectItem>
                          <SelectItem value="opera">Opera</SelectItem>
                          <SelectItem value="ivvy">iVvy</SelectItem>
                          <SelectItem value="tripleseat">Tripleseat</SelectItem>
                          <SelectItem value="priava">Priava</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.pms.example.com" {...field} data-testid="input-api-endpoint" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="..." {...field} data-testid="input-api-key" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Schedule (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="*/15 * * * *" {...field} data-testid="input-schedule" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createConnector.isPending} data-testid="button-submit-connector">
              {createConnector.isPending ? "Creating..." : "Create Connector"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateConnectorDialog({ connector }: { connector: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateConnector = useUpdateConnector();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: connector.name || "",
      source: connector.source || "",
      apiEndpoint: connector.apiEndpoint || "",
      apiKey: "", // Don't prefill secrets
      webhookSecret: "",
      schedule: connector.schedule || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Only send fields that were provided
    const updateData: Record<string, string> = { name: data.name };
    if (data.apiEndpoint) updateData.apiEndpoint = data.apiEndpoint;
    if (data.apiKey) updateData.apiKey = data.apiKey;
    if (data.schedule) updateData.schedule = data.schedule;
    
    updateConnector.mutate({ id: connector.id, data: updateData }, {
      onSuccess: () => {
        toast({ title: "Connector updated successfully" });
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetConnectorQueryKey(connector.id) });
        queryClient.invalidateQueries({ queryKey: getListConnectorsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to update connector", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-edit-connector">
          <Edit className="mr-2 h-4 w-4" />
          Edit Configuration
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Connector</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-connector-name-update" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-api-endpoint-update" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (Leave blank to keep unchanged)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="..." {...field} data-testid="input-api-key-update" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="*/15 * * * *" {...field} data-testid="input-schedule-update" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={updateConnector.isPending} data-testid="button-submit-connector-update">
              {updateConnector.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
