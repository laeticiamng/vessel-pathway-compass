/**
 * AI Reconstruction Model Registry
 * --------------------------------
 * Single source of truth for the 4 pipelines exposed in
 * /app/research/ai-recon. Every metric, dataset and weight origin shown in
 * the UI MUST come from this file — no magic numbers, no implicit claims.
 *
 * Aligned with v8.3 positioning: VASCU-LINK touches the VISUAL chain only,
 * never claims diagnostic superiority over MRI/CTA/MRA/DSA. The current
 * client-side stub produces SIMULATED metrics only — there is no GPU
 * backend wired in this preview.
 */

export type PipelineId =
  | "compressed-sensing"
  | "unet-denoising"
  | "modl"
  | "diffusion";

export type PipelineFamily =
  | "classical"
  | "supervised-dl"
  | "unrolled"
  | "generative";

export type WeightsOrigin =
  | "Pretrained author weights"
  | "Trained in-house"
  | "Not loaded — placeholder";

export type PublishedMetric = {
  metric: "PSNR (dB)" | "SSIM" | "NRMSE" | "Acceleration" | "Runtime (s)";
  value: string;
  conditions: string;
};

export interface ModelEntry {
  id: PipelineId;
  name: string;
  family: PipelineFamily;
  shortDescription: string;
  provenance: {
    paperRef: string; // Vancouver-style
    codeRef: string; // GitHub URL or "Reimplemented in-house"
    weightsOrigin: WeightsOrigin;
    license: string;
  };
  trainingData: {
    dataset: string;
    nSubjects: number | "N/A";
    bodyRegion: string;
    fieldStrength: string;
    acquisitionType: string;
  };
  validationData: {
    dataset: string;
    nSubjects: number | "N/A";
    metricsReported: string[];
  };
  publishedMetrics: PublishedMetric[];
  domainShift: string;
  limitations: string[];
  currentStatus:
    | "Simulated output only — no GPU backend"
    | "Inference active";
  trl: number; // 1-9
}

export const MODEL_REGISTRY: Record<PipelineId, ModelEntry> = {
  "compressed-sensing": {
    id: "compressed-sensing",
    name: "Compressed Sensing (L1-wavelet)",
    family: "classical",
    shortDescription:
      "L1-wavelet reconstruction from undersampled k-space. Non-ML baseline.",
    provenance: {
      paperRef:
        "Lustig M, Donoho D, Pauly JM. Sparse MRI: The application of compressed sensing for rapid MR imaging. Magn Reson Med. 2007;58(6):1182-95. PMID 17969013.",
      codeRef:
        "Reimplemented in-house from published equations (BART toolbox reference: https://mrirecon.github.io/bart/).",
      weightsOrigin: "Not loaded — placeholder",
      license: "Algorithmic (no weights). BART itself is BSD-3-Clause.",
    },
    trainingData: {
      dataset: "N/A — no training (analytical method)",
      nSubjects: "N/A",
      bodyRegion: "N/A",
      fieldStrength: "N/A",
      acquisitionType: "N/A",
    },
    validationData: {
      dataset: "Brain & knee single-coil retrospective undersampling (Lustig 2007).",
      nSubjects: "N/A",
      metricsReported: ["Visual reading", "Aliasing residuals"],
    },
    publishedMetrics: [
      {
        metric: "Acceleration",
        value: "×2.4 – ×8",
        conditions: "Brain/angiography, retrospective Cartesian undersampling, Lustig 2007.",
      },
    ],
    domainShift:
      "Original validation: brain/knee/cardiac. No published validation on peripheral run-off MRA. Performance on lower-limb vascular MRA is unknown.",
    limitations: [
      "Sensitivity parameter (λ) hand-tuned per acquisition — no automatic selection.",
      "Convergence dependent on coil sensitivity estimation; sub-optimal with body coil only.",
      "No published benchmark on peripheral artery MRA.",
      "Does not recover content absent from undersampled k-space — limits acceleration ceiling.",
    ],
    currentStatus: "Simulated output only — no GPU backend",
    trl: 4,
  },

  "unet-denoising": {
    id: "unet-denoising",
    name: "U-Net Denoising (2D patches)",
    family: "supervised-dl",
    shortDescription:
      "Patch-based CNN denoiser applied to low-SNR magnitude images.",
    provenance: {
      paperRef:
        "Ronneberger O, Fischer P, Brox T. U-Net: Convolutional Networks for Biomedical Image Segmentation. MICCAI 2015. arXiv:1505.04597.",
      codeRef:
        "Architecture reimplemented in-house (PyTorch). No pretrained weights loaded in this preview.",
      weightsOrigin: "Not loaded — placeholder",
      license: "Architecture: open. In-house implementation: proprietary.",
    },
    trainingData: {
      dataset:
        "Reference architecture trained on synthetic Gaussian/Rician noise pairs from public IXI brain MRI subset.",
      nSubjects: 50,
      bodyRegion: "Brain (T1-weighted)",
      fieldStrength: "1.5 T / 3 T",
      acquisitionType: "Cartesian gradient-echo",
    },
    validationData: {
      dataset: "Held-out IXI subset.",
      nSubjects: 10,
      metricsReported: ["PSNR (dB)", "SSIM"],
    },
    publishedMetrics: [
      {
        metric: "PSNR (dB)",
        value: "+3 to +6 vs noisy input",
        conditions: "Brain T1 at SNR ≈ 12, supervised pairs (architecture-level reference, not VASCU-LINK specific).",
      },
    ],
    domainShift:
      "Trained on brain T1, applied here to (potential) peripheral MRA: severe distribution shift. Vessel-like structures may be smoothed or hallucinated. No vascular validation.",
    limitations: [
      "Strong over-smoothing risk on thin vessel walls.",
      "Patch borders may introduce visible seams.",
      "Hallucinations plausible at acceleration > 4× — no out-of-distribution detection.",
      "No uncertainty map provided.",
      "No vascular-specific training set used.",
    ],
    currentStatus: "Simulated output only — no GPU backend",
    trl: 3,
  },

  modl: {
    id: "modl",
    name: "MoDL (Model-based Deep Learning)",
    family: "unrolled",
    shortDescription:
      "Unrolled iterative network alternating CNN denoiser and data-consistency steps.",
    provenance: {
      paperRef:
        "Aggarwal HK, Mani MP, Jacob M. MoDL: Model-Based Deep Learning Architecture for Inverse Problems. IEEE Trans Med Imaging. 2019;38(2):394-405. PMID 30106719.",
      codeRef:
        "Reference: https://github.com/hkaggarwal/modl (author-released). Reimplemented in-house, weights not loaded.",
      weightsOrigin: "Not loaded — placeholder",
      license: "Reference code: author license (research use). In-house port: proprietary.",
    },
    trainingData: {
      dataset: "Parallel-imaging brain MRI (author dataset).",
      nSubjects: 5,
      bodyRegion: "Brain",
      fieldStrength: "3 T",
      acquisitionType: "Multi-coil Cartesian, 4–6× retrospective undersampling",
    },
    validationData: {
      dataset: "Held-out brain volumes from author dataset.",
      nSubjects: 2,
      metricsReported: ["PSNR (dB)", "SSIM"],
    },
    publishedMetrics: [
      {
        metric: "PSNR (dB)",
        value: "≈ 38 (4×), ≈ 34 (6×)",
        conditions: "Brain multi-coil, Aggarwal 2019, table II.",
      },
      {
        metric: "Acceleration",
        value: "×4 – ×6",
        conditions: "Author benchmark; not validated on peripheral MRA.",
      },
    ],
    domainShift:
      "Brain → peripheral run-off shift unaddressed. Coil geometry, motion regime and vessel calibre differ. Expect degraded fidelity.",
    limitations: [
      "Sensitive to coil sensitivity map quality.",
      "Iterations capped at 6 in reference paper — too few for high acceleration.",
      "Data-consistency assumes Cartesian k-space; non-Cartesian acquisitions require extra adapters.",
      "No published vascular benchmark.",
      "No uncertainty quantification.",
    ],
    currentStatus: "Simulated output only — no GPU backend",
    trl: 4,
  },

  diffusion: {
    id: "diffusion",
    name: "Score-based Diffusion (posterior sampling)",
    family: "generative",
    shortDescription:
      "Posterior sampling with a learned score model for accelerated MRA.",
    provenance: {
      paperRef:
        "Chung H, Ye JC. Score-based diffusion models for accelerated MRI. Medical Image Analysis. 2022;80:102479.",
      codeRef:
        "Reference: https://github.com/HJ-harry/score-MRI (author). Not integrated — placeholder only.",
      weightsOrigin: "Not loaded — placeholder",
      license: "Reference code: research use. Not embedded in VASCU-LINK.",
    },
    trainingData: {
      dataset: "fastMRI knee subset (Zbontar 2018).",
      nSubjects: 973,
      bodyRegion: "Knee",
      fieldStrength: "1.5 T / 3 T",
      acquisitionType: "Multi-coil Cartesian, k-space retrospectively undersampled",
    },
    validationData: {
      dataset: "fastMRI knee validation split.",
      nSubjects: 199,
      metricsReported: ["PSNR (dB)", "SSIM", "NRMSE"],
    },
    publishedMetrics: [
      {
        metric: "PSNR (dB)",
        value: "≈ 33 (4×), ≈ 30 (8×)",
        conditions: "Knee fastMRI, Chung 2022.",
      },
      {
        metric: "Acceleration",
        value: "up to ×8",
        conditions: "Posterior sampling, hundreds of NFE per slice.",
      },
    ],
    domainShift:
      "Knee → vascular MRA: anatomy and contrast are completely different. Generative models are known to hallucinate plausible-looking structures, which is a clinical safety risk.",
    limitations: [
      "Hallucination risk inherent to generative models — incompatible with stand-alone diagnostic use.",
      "Sampling cost: hundreds to thousands of network evaluations per slice; no real-time use.",
      "No calibrated uncertainty out of the box.",
      "Performance highly dependent on score-model training distribution.",
      "Not evaluated on peripheral arteries.",
    ],
    currentStatus: "Simulated output only — no GPU backend",
    trl: 2,
  },
};

export const PIPELINE_ORDER: PipelineId[] = [
  "compressed-sensing",
  "unet-denoising",
  "modl",
  "diffusion",
];

export const BASELINE_METHOD = {
  name: "Zero-filled IFFT",
  description:
    "Inverse FFT of the zero-filled undersampled k-space. Standard non-AI reference for any reconstruction comparison — ensures no metric is shown without a comparator.",
  reference:
    "Bernstein MA, et al. Handbook of MRI Pulse Sequences. Elsevier; 2004 (chap. 13).",
} as const;

/**
 * Produce a SIMULATED result object for a job.
 * Values are deterministic-ish stubs derived from Math.random — the structure
 * mirrors what a real pipeline would emit but every field is flagged as
 * simulated. No metric is ever shown without its baseline counterpart.
 */
export function buildSimulatedResult(pipeline: PipelineId) {
  const baselinePsnr = +(22 + Math.random() * 4).toFixed(2);
  const baselineSsim = +(0.62 + Math.random() * 0.08).toFixed(3);
  const aiPsnr = +(baselinePsnr + 2 + Math.random() * 5).toFixed(2);
  const aiSsim = +(Math.min(0.98, baselineSsim + 0.05 + Math.random() * 0.15)).toFixed(3);
  const accel = +(2 + Math.random() * 4).toFixed(1);

  return {
    status: "simulated" as const,
    pipeline,
    baseline: {
      method: BASELINE_METHOD.name,
      psnr_db: baselinePsnr,
      ssim: baselineSsim,
    },
    ai_output: {
      psnr_db: aiPsnr,
      ssim: aiSsim,
      nrmse: +(0.08 + Math.random() * 0.05).toFixed(3),
    },
    delta_vs_baseline: {
      psnr_db: +(aiPsnr - baselinePsnr).toFixed(2),
      ssim: +(aiSsim - baselineSsim).toFixed(3),
    },
    acquisition_assumptions: {
      acceleration_factor: accel,
      undersampling_mask: "Variable-density Cartesian (synthetic)",
      coil_count: 8,
    },
    runtime_s: +(Math.random() * 30 + 10).toFixed(1),
    not_clinically_valid: true,
    generated_by: "client-side stub v1 — no GPU inference performed",
  };
}

export type SimulatedResult = ReturnType<typeof buildSimulatedResult>;
