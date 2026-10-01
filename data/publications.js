/* Publication list — edit this file to add or update papers.
   Fields:
     y      year                    t    title
     a      authors (as published)  j    journal, volume, article/pages
     url    link for the title      doi  DOI string, or null if none
     c      Google Scholar citations, or null if not yet counted
     first  true if first author
     cat    any of "storage", "magnetism", "nano" (drives the filters)
     kind   optional label, e.g. "Review" or "Conference"
   Order does not matter: the build sorts by year, then citations.

   After editing, run:  node tools/build.js
   That writes the list, the paper counts and the search-engine data into
   index.html. (A GitHub check fails if this step is forgotten.) */
const PUBLICATIONS = [
  {y:2026, t:"Exploring the potential charge storage mechanism in LaFeO₃ nano layers under magnetic field",
   a:"N. Chougala, A.S. Patil, S. Kulkarni, M.P. Sathisha, S. Matteppanavar",
   j:"Journal of Power Sources 665, 238981", url:"https://doi.org/10.1016/j.jpowsour.2025.238981", doi:"10.1016/j.jpowsour.2025.238981",
   c:null, first:true, cat:["storage","magnetism"]},
  {y:2026, t:"Electrochemical charge-storage behavior of NdFeO₃ perovskite as a cathode material for supercapacitor applications",
   a:"N. Chougala, A.S. Patil, B. Angadi, S. Rayaprol, S. Patil, P. Swami, S. Matteppanavar",
   j:"Bulletin of Materials Science 49, 186", url:"https://scholar.google.com/scholar?q=%22Electrochemical+charge-storage+behavior+of+NdFeO3+perovskite+as+a+cathode+material%22", doi:null,
   c:null, first:true, cat:["storage","nano"]},
  {y:2026, t:"Unlocking potential for revolutionizing energy storage performances of graphene nanoplatelets and MWCNT-induced self-assembly of liquid crystal nanocomposites",
   a:"V. Adimule, R. Joshi, V. Sharma, R. Keri, S. Matteppanavar, S. Nandi, R.M. Bhat, P. Kumar, N. Chougala, N.L. Tarwal",
   j:"Journal of Energy Storage 162, 122059", url:"https://doi.org/10.1016/j.est.2026.122059", doi:"10.1016/j.est.2026.122059",
   c:null, first:false, cat:["storage","nano"]},
  {y:2026, t:"Al₂O₃ doped α-Fe₂O₃ nanoparticles for supercapacitor applications under magnetic field",
   a:"S. Latthe, N. Chougala, S. Dodamani, M.P. Sathisha, S. Kulkarni, et al.",
   j:"Sustainable Energy Technologies for Smart Infrastructure (ICAM-SEEi 2025), Springer, pp. 100–113", url:"https://link.springer.com/chapter/10.1007/978-3-032-33953-9_8", doi:"10.1007/978-3-032-33953-9_8",
   c:null, first:false, cat:["storage","nano"], kind:"Conference"},
  {y:2025, t:"Electrochemical supercapacitor properties of CuO-doped α-Fe₂O₃ nanosheets under mT magnetic field",
   a:"S. Latthe, N. Chougala, S. Dodamani, H. Badiger, S. Kumbar, S. Kulkarni, S. Matteppanavar",
   j:"Journal of Alloys and Compounds 1010, 177896", url:"https://doi.org/10.1016/j.jallcom.2024.177896", doi:"10.1016/j.jallcom.2024.177896",
   c:27, first:false, cat:["storage","nano"]},
  {y:2025, t:"Realization of nickel doped carbon enriched graphitic carbon nitride for diffusion controlled charge storage",
   a:"M.S. Pujar, S. Yalavara, V. Wadeyar, S. Khot, N. Chougala, S. Kalagi, S. Matteppanavar, S. Kulkarni",
   j:"Journal of Energy Storage 105, 114774", url:"https://www.sciencedirect.com/science/article/pii/S2352152X24043603", doi:null,
   c:26, first:false, cat:["storage","nano"]},
  {y:2025, t:"Unlocking the potential of Pb(Fe₀.₆₇W₀.₃₃)O₃: A multifunctional multiferroic for next-gen magnetocaloric, memory, and supercapacitor technologies",
   a:"N. Chougala, K. Manjunatha, A.S. Patil, T.-E. Hsu, S.-L. Yu, S.Y. Wu, M.C. Oliveira, E. Longo, R.A.P. Ribeiro, H.-H. Chiu, M.-K. Ho, S. Rayaprol, B. Angadi, S. Latthe, S. Kulkarni, S. Matteppanavar",
   j:"Journal of Energy Storage 134, 118145", url:"https://doi.org/10.1016/j.est.2025.118145", doi:"10.1016/j.est.2025.118145",
   c:7, first:true, cat:["storage","magnetism"]},
  {y:2025, t:"Investigation of electrochemical properties of nano-structured NdFeO₃ orthoferrite",
   a:"N. Chougala, A.S. Patil, B.G. Hegde, V.D. Patake, T. Manjunatha, S. Kulkarni, S. Matteppanavar",
   j:"Journal of Electronic Materials 54, 10296–10305", url:"https://doi.org/10.1007/s11664-025-12385-6", doi:"10.1007/s11664-025-12385-6",
   c:6, first:true, cat:["storage","nano"]},
  {y:2025, t:"Structural, magnetic, electrical, and Mössbauer study of Yb-doped cobalt zinc ferrite nanoparticles",
   a:"H. Badiger, B.G. Hegde, S.P. Kubrin, N. Chougala, S. Matteppanavar",
   j:"Journal of Materials Science: Materials in Electronics 36, 1576", url:"https://doi.org/10.1007/s10854-025-15632-y", doi:"10.1007/s10854-025-15632-y",
   c:null, first:false, cat:["magnetism","nano"]},
  {y:2024, t:"Magnetic transition, magnetocaloric and supercapacitor behavior in synthesized Sn₀.₆Mn₀.₁Ge₀.₃Te alloys",
   a:"K. Manjunatha, H. Zhang, H.-H. Chiu, M.-K. Ho, T.-E. Hsu, S.-L. Yu, N. Chougala, N.S. Maruthi, S. Kulkarni, C.-L. Cheng, S.Y. Wu, S. Matteppanavar",
   j:"Journal of Energy Storage 98, 113182", url:"https://www.sciencedirect.com/science/article/pii/S2352152X24027683", doi:null,
   c:12, first:false, cat:["storage","magnetism"]},
  {y:2023, t:"Magnetoelectric based multiferroics",
   a:"N. Chougala, T. Manjunatha, B. Angadi, S. Matteppanavar",
   j:"Archives of Organic and Inorganic Chemical Sciences 5(5)", url:"https://doi.org/10.32474/AOICS.2023.05.000222", doi:"10.32474/AOICS.2023.05.000222",
   c:null, first:true, cat:["magnetism"], kind:"Review"}
];

