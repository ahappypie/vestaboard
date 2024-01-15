{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  inputs.deno2nix = {
    url = "github:sno2wman/deno2nix";
    inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, deno2nix }:
    let
      supportedSystems = [ "x86_64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit system; overlays = [ deno2nix.overlays.default ]; };

      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [ deno ];
        };
      });
      packages = forEachSupportedSystem ({ pkgs }: {
        vbclock = pkgs.deno2nix.mkExecutable {
          pname = "vbclock";
          version = "0.0.1";

          src = ./.;

          entrypoint = "./src/clock.ts";
          lockfile = "./deno.lock";
          config = "./deno.json";

          allow = {
            all = true;
          };

          additionalDenoFlags = "--unstable";
        };
      });
    };
}
