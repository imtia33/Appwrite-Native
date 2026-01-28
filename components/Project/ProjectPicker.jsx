import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ProjectPicker({ projects, selectedProject, setSelectedProject }) {
  const ref = React.useRef(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  return (
    <Select value={selectedProject?.$id} onValueChange={(value) => {
      const idToFind = typeof value === 'object' ? (value.$id || value.value) : value;
      const project = projects.find(p => p.$id === idToFind);
      if (project) {
        setSelectedProject(project);
      }
    }}>
      <SelectTrigger ref={ref} className="w-auto border border-0 bg-transparent dark:text-muted-foreground">
        <SelectValue className="font-semibold text-muted-foreground" placeholder={selectedProject?.name || "Select Project"} />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-[180px]">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground">Projects</SelectLabel>
          {projects.map((project) => (
            <SelectItem key={project.$id} label={project.name} value={project.$id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
